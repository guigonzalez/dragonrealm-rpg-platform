import OpenAI from "openai";

// A versão mais recente do modelo OpenAI é "gpt-4o", lançado em 13 de maio de 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type NPCGenerationOptions = {
  tipo: 'npc' | 'creature';
  campanha?: string;
  nivel?: string;
  terreno?: string;
  estilo?: string;
};

export interface GeneratedNPC {
  name: string;
  role: string;
  motivation: string;
  relationships: string;
  abilities: string;
  appearance: string;
  notes: string;
  personality: string; 
  race: string;
  occupation: string;
  location: string;
  memorableTrait: string;
  threatLevel: string;
  healthPoints: string;
  strength: string;
  dexterity: string;
  constitution: string;
  intelligence: string;
  wisdom: string;
  charisma: string;
  specialAbilities: string;
  plotHooks: string;
  entityType: 'npc' | 'creature';
  imageUrl?: string; // URL da imagem gerada
}

// Função para gerar imagens usando DALL-E
export async function generateImage(prompt: string): Promise<string | null> {
  try {
    console.log("Gerando imagem com DALL-E:", prompt);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    console.log("Resposta do DALL-E recebida");
    
    if (response.data && response.data.length > 0 && response.data[0].url) {
      return response.data[0].url;
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao gerar imagem com DALL-E:", error);
    return null;
  }
}

export async function generateNPC(options: NPCGenerationOptions): Promise<GeneratedNPC> {
  try {
    console.log("Gerando NPC com as opções:", options);
    
    const isPT = true; // Estamos usando português como padrão
    const isCreature = options.tipo === 'creature';
    
    // Construa o prompt para o tipo certo (NPC ou Criatura)
    let prompt = isCreature 
      ? `Gere uma criatura para Dungeons & Dragons 5e ${isPT ? 'em português' : 'em inglês'}.`
      : `Gere um NPC para Dungeons & Dragons 5e ${isPT ? 'em português' : 'em inglês'}.`;
    
    // Adicionar contexto da campanha se fornecido
    if (options.campanha) {
      prompt += ` A campanha tem como tema "${options.campanha}".`;
    }
    
    // Adicionar contexto de nível/dificuldade se fornecido
    if (options.nivel) {
      if (isCreature) {
        prompt += ` A criatura deve ser de nível/desafio ${options.nivel}.`;
      } else {
        prompt += ` O NPC deve ser compatível com personagens de nível ${options.nivel}.`;
      }
    }
    
    // Adicionar contexto de terreno/localização se fornecido
    if (options.terreno) {
      prompt += ` ${isCreature ? 'A criatura' : 'O NPC'} está em/associado com o terreno: ${options.terreno}.`;
    }
    
    // Adicionar preferência de estilo se fornecido
    if (options.estilo) {
      prompt += ` O estilo geral deve ser: ${options.estilo}.`;
    }
    
    // Solicitar formato específico com todos os campos
    prompt += `\n\nRetorne APENAS no formato JSON com estas propriedades:
    {
      "name": "Nome",
      "role": "Papel (aliado, vilão, neutro, obstáculo) - você decide",
      "race": "${isCreature ? 'Tipo de criatura' : 'Raça'}",
      "occupation": "${isCreature ? 'Comportamento' : 'Ocupação'}",
      "location": "Habitat natural ou local",
      "motivation": "Motivação principal",
      "relationships": "Relacionamentos e contexto social",
      "appearance": "Aparência física notável",
      "personality": "Traços de personalidade",
      "abilities": "Habilidades importantes",
      "memorableTrait": "Um traço memorável único",
      "threatLevel": "Nível de ameaça (Inofensivo, Desafiador, Perigoso, Chefe)",
      "strength": "Valor de Força (entre 3-20)",
      "dexterity": "Valor de Destreza (entre 3-20)",
      "constitution": "Valor de Constituição (entre 3-20)",
      "intelligence": "Valor de Inteligência (entre 3-20)",
      "wisdom": "Valor de Sabedoria (entre 3-20)",
      "charisma": "Valor de Carisma (entre 3-20)",
      "healthPoints": "Pontos de vida aproximados",
      "specialAbilities": "Habilidades especiais ou ataques",
      "plotHooks": "Ideias de história envolvendo este ${isCreature ? 'monstro' : 'personagem'}",
      "notes": "Outras informações úteis para o Mestre"
    }`;
    
    console.log("Prompt:", prompt);

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Modelo mais recente
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.8, // Um pouco de aleatoriedade para criatividade
    });

    console.log("Resposta da OpenAI recebida");
    
    // Recuperar e analisar a resposta
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Resposta vazia da OpenAI");
    }
    
    const data = JSON.parse(content);
    
    // Gerar uma imagem com DALL-E baseada nas características do NPC
    let imageUrl = null;
    try {
      // Criando um prompt para a imagem com base nas características do NPC/Criatura
      const imagePrompt = isCreature
        ? `Uma ilustração fantástica e detalhada para D&D de uma criatura chamada "${data.name}". ${data.appearance}. ${data.memorableTrait}. Estilo de arte de fantasia medieval.`
        : `Um retrato de fantasia detalhado para D&D de ${data.race ? 'um(a) ' + data.race : 'um personagem'} chamado(a) "${data.name}". ${data.appearance}. ${data.memorableTrait}. Estilo de arte de fantasia medieval.`;
      
      console.log("Prompt para geração de imagem:", imagePrompt);
      
      // Gerar a imagem
      imageUrl = await generateImage(imagePrompt);
      console.log("URL da imagem gerada:", imageUrl);
    } catch (imageError) {
      console.error("Erro ao gerar imagem, continuando sem imagem:", imageError);
    }
    
    // Retorna o NPC gerado com o tipo selecionado e imagem (se existir)
    return {
      ...data,
      entityType: options.tipo,
      imageUrl: imageUrl || undefined
    };
  } catch (error) {
    console.error("Erro ao gerar NPC:", error);
    throw new Error("Falha ao gerar NPC com OpenAI");
  }
}
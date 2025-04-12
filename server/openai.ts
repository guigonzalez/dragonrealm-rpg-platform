import OpenAI from "openai";

// A versão mais recente do modelo OpenAI é "gpt-4o", lançado em 13 de maio de 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type NPCGenerationOptions = {
  tipo: 'npc' | 'creature';
  campanha?: string;
  nivel?: string;
  terreno?: string;
  estilo?: string;
  campaignContext?: string; // Adiciona contexto da campanha
};

export type LocationGenerationOptions = {
  tipo: 'location';
  campaignContext?: string; // Contexto da campanha
  tipoLocalizacao?: string; // Urbana, floresta, caverna, dungeon, etc.
  nomeMundo?: string; // Nome do mundo/continente
  importanciaNaHistoria?: string; // Principal, secundária, casual
  detalhes?: string; // Detalhes adicionais especificados pelo usuário
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
}

export interface GeneratedLocation {
  name: string;
  description: string;
  history: string;
  notableFeatures: string;
  secrets: string;
  inhabitants: string;
  hooks: string;
  atmosphere: string;
  threats: string;
  treasures: string;
  notes: string;
  imageDescription: string;
}

export async function generateLocation(options: LocationGenerationOptions): Promise<GeneratedLocation> {
  try {
    console.log("Gerando localização com as opções:", options);
    
    // Construa o prompt base
    let prompt = `Gere uma localização detalhada para uma campanha de Dungeons & Dragons 5e em português.`;
    
    // Adicionar tipo de localização se fornecido
    if (options.tipoLocalizacao) {
      prompt += ` O tipo da localização é: ${options.tipoLocalizacao}.`;
    }
    
    // Adicionar nome do mundo/continente se fornecido
    if (options.nomeMundo) {
      prompt += ` Esta localização faz parte do mundo/continente chamado ${options.nomeMundo}.`;
    }
    
    // Adicionar importância na história
    if (options.importanciaNaHistoria) {
      prompt += ` Esta localização tem importância ${options.importanciaNaHistoria} na narrativa da campanha.`;
    }
    
    // Adicionar detalhes específicos
    if (options.detalhes) {
      prompt += ` Detalhes adicionais sobre esta localização: ${options.detalhes}.`;
    }
    
    // Adicionar contexto da campanha se fornecido
    if (options.campaignContext) {
      prompt += `\n\nInformações detalhadas da campanha para usar como referência:\n${options.campaignContext}\n\nAo criar esta localização, use essas informações para incorporar personagens, locais existentes e temas da campanha.`;
    }
    
    // Solicitar formato específico com todos os campos
    prompt += `\n\nRetorne APENAS no formato JSON com estas propriedades:
    {
      "name": "Nome da localização",
      "description": "Descrição detalhada do local e aparência",
      "history": "História e origem da localização",
      "notableFeatures": "Características notáveis e elementos visualmente distintivos",
      "secrets": "Segredos ou mistérios escondidos nesta localização",
      "inhabitants": "Criaturas, NPCs ou grupos que habitam ou frequentam o local",
      "hooks": "Ganchos de história ou missões relacionadas a esta localização",
      "atmosphere": "Ambiente, clima e sensação geral do local",
      "threats": "Perigos ou ameaças presentes nesta localização",
      "treasures": "Tesouros, recursos ou itens valiosos que podem ser encontrados",
      "notes": "Informações adicionais relevantes para o Mestre",
      "imageDescription": "Descrição detalhada para geração de imagem deste local"
    }`;
    
    console.log("Prompt para geração de localização:", prompt);

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Modelo mais recente
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.7,
    });

    console.log("Resposta da OpenAI para localização recebida");
    
    // Recuperar e analisar a resposta
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Resposta vazia da OpenAI");
    }
    
    const data = JSON.parse(content) as GeneratedLocation;
    return data;
  } catch (error) {
    console.error("Erro ao gerar localização:", error);
    throw new Error("Falha ao gerar localização com OpenAI");
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
    
    // Adicionar contexto da campanha se fornecido
    if (options.campaignContext) {
      prompt += `\n\nInformações detalhadas da campanha para usar como referência:\n${options.campaignContext}\n\nAo criar ${isCreature ? 'a criatura' : 'o NPC'}, use essas informações para incorporar personagens, locais e temas existentes na campanha.`;
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
    
    // Mover o campo relationships para o campo notes para evitar erro de coluna inexistente no banco
    const processedData = { ...data };
    
    // Se houver o campo relationships, concatená-lo ao campo notes
    if (processedData.relationships) {
      processedData.notes = `${processedData.notes || ''}\nRelações: ${processedData.relationships}`;
      // Remover o campo relationships para evitar erro de coluna inexistente
      delete processedData.relationships;
    }
    
    // Retorna o NPC gerado com o tipo selecionado e campos ajustados
    return {
      ...processedData,
      entityType: options.tipo
    };
  } catch (error) {
    console.error("Erro ao gerar NPC:", error);
    throw new Error("Falha ao gerar NPC com OpenAI");
  }
}
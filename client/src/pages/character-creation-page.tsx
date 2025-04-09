import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CharacterCreation from "@/components/character/CharacterCreation";

export default function CharacterCreationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="container mx-auto px-4 py-8">
          <CharacterCreation />
        </div>
      </main>
      <Footer />
    </div>
  );
}

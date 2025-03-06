import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CompetitionDirectory from "../competitions/CompetitionDirectory";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      <Navbar />

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Discover & Enter Amazing Competitions
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find the perfect competitions to showcase your skills or try your
              luck
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                Browse Competitions <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                How It Works
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="container mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                name: "Design",
                image:
                  "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
              },
              {
                name: "Technology",
                image:
                  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
              },
              {
                name: "Writing",
                image:
                  "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
              },
              {
                name: "Photography",
                image:
                  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
              },
            ].map((category) => (
              <div
                key={category.name}
                className="relative rounded-lg overflow-hidden group cursor-pointer"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-32 md:h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <h3 className="text-white font-medium">{category.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competition Directory */}
        <div className="bg-slate-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Active Competitions
            </h2>
            <CompetitionDirectory />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

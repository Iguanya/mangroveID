import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Leaf, Users, Star } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">MangroveID</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>
          <Link href="/auth/signup">
            <Button className="bg-primary hover:bg-primary/90">Get Started Free</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-accent/10 text-accent border-accent/20">
              Free AI-Powered Plant Identification
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Identify Mangroves & Coastal Plants with <span className="text-primary">AI Precision</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Discover, learn, and contribute to coastal ecosystem conservation with our free plant identification
              platform. Scan stems, branches, and leaves for instant species recognition or upload photos to help train
              our AI model.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Camera className="mr-2 h-5 w-5" />
                  Start Scanning Now
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload & Label Photos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Advanced Plant Recognition Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge computer vision with botanical expertise to deliver accurate plant
              identification.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Camera className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Real-time Scanning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Use your device camera to instantly identify mangroves and coastal plants by scanning stems, branches,
                  and leaves.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Upload className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Photo Upload & Labeling</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Contribute to our growing database by uploading and labeling plant photos to help improve our AI
                  model.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Leaf className="h-12 w-12 text-secondary mb-4" />
                <CardTitle>Species Database</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access comprehensive information about mangrove species and coastal indigenous plants with detailed
                  characteristics.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join researchers, conservationists, and nature enthusiasts in building the world's largest coastal
                  plant database.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Trusted by Researchers Worldwide</h2>
            <p className="text-xl text-muted-foreground">See what conservation experts are saying about MangroveID</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "MangroveID has revolutionized our field research. The accuracy of plant identification has saved us
                  countless hours and improved our data quality significantly."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary font-semibold">DR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Dr. Sarah Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Marine Biologist, Ocean Institute</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The community aspect of this platform is incredible. Being able to contribute to the database while
                  learning from other researchers creates a powerful collaborative environment."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-secondary font-semibold">MJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Prof. Michael Johnson</p>
                    <p className="text-sm text-muted-foreground">Environmental Scientist, Green University</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "As a conservation photographer, MangroveID helps me document and identify species accurately. The
                  mobile responsiveness makes it perfect for fieldwork."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-accent font-semibold">AL</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Anna Liu</p>
                    <p className="text-sm text-muted-foreground">Conservation Photographer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Advance Coastal Conservation?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join researchers, conservationists, and nature enthusiasts using MangroveID to protect our coastal
            ecosystems. Start identifying plants and contributing to our database today - completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Camera className="mr-2 h-5 w-5" />
                Start Identifying Plants
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 bg-transparent"
              >
                <Upload className="mr-2 h-5 w-5" />
                Contribute Photos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">MangroveID</span>
              </div>
              <p className="text-muted-foreground">
                Free AI-powered plant identification platform advancing coastal ecosystem conservation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Plant Scanner
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Photo Upload
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Research Papers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Species Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 MangroveID. All rights reserved. Free platform for coastal conservation.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

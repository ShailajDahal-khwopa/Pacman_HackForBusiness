
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Search, Upload, Store, TrendingUp } from 'lucide-react';

interface CompetitorProduct {
  name: string;
  price: string;
  image_url: string;
  similarity: number;
}

interface CompetitionResult {
  [businessName: string]: CompetitorProduct[];
}

const Competition = () => {
  const [keyword, setKeyword] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState<CompetitionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSearch = async () => {
    if (!keyword || !selectedFile) {
      toast({
        title: "Missing Information",
        description: "Please provide both keyword and image",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('keyword', keyword);
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/match', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResults(data);
      toast({
        title: "Analysis Complete",
        description: "Competition analysis has been generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze competition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-red-600 bg-red-50';
    if (similarity >= 0.6) return 'text-orange-600 bg-orange-50';
    if (similarity >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getSimilarityText = (similarity: number) => {
    if (similarity >= 0.8) return 'High Competition';
    if (similarity >= 0.6) return 'Medium Competition';
    if (similarity >= 0.4) return 'Low Competition';
    return 'Minimal Competition';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competition Analysis</h1>
          <p className="text-gray-600 mt-2">Analyze your products against competitors in the market</p>
        </div>

        {/* Search Form */}
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Search className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Product Analysis</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Product Keyword</label>
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Enter product keyword (e.g., 'tea', 'rice', 'oil')"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Product Image</label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <Upload className="absolute right-3 top-3 h-6 w-6 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={handleSearch}
                disabled={isLoading || !keyword || !selectedFile}
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 px-8"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Trophy className="mr-2 h-4 w-4" />
                    Analyze Competition
                  </div>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Competition Analysis Results</h2>
            </div>

            {Object.entries(results).map(([businessName, products]) => (
              <Card key={businessName} className="border-0 shadow-lg">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Store className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">{businessName}</h3>
                      <p className="text-sm text-gray-600">{products.length} matching products found</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{product.name}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">{product.price}</span>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSimilarityColor(product.similarity)}`}>
                            {getSimilarityText(product.similarity)}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Similarity: {(product.similarity * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {results === null && (
          <Card className="border-0 shadow-lg">
            <div className="p-12 text-center">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h3>
              <p className="text-gray-500">Upload a product image and enter a keyword to start analyzing your competition</p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Competition;

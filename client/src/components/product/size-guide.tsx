import { useState } from "react";
import { Ruler, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SizeGuideProps {
  productType?: string;
}

const sizeChart = {
  blouse: [
    { size: 'XS', bust: '30-32', waist: '24-26', hip: '32-34' },
    { size: 'S', bust: '32-34', waist: '26-28', hip: '34-36' },
    { size: 'M', bust: '34-36', waist: '28-30', hip: '36-38' },
    { size: 'L', bust: '36-38', waist: '30-32', hip: '38-40' },
    { size: 'XL', bust: '38-40', waist: '32-34', hip: '40-42' },
    { size: 'XXL', bust: '40-42', waist: '34-36', hip: '42-44' },
  ],
  petticoat: [
    { size: 'XS', waist: '24-26', hip: '32-34', length: '36-38' },
    { size: 'S', waist: '26-28', hip: '34-36', length: '36-38' },
    { size: 'M', waist: '28-30', hip: '36-38', length: '36-38' },
    { size: 'L', waist: '30-32', hip: '38-40', length: '36-38' },
    { size: 'XL', waist: '32-34', hip: '40-42', length: '36-38' },
    { size: 'XXL', waist: '34-36', hip: '42-44', length: '36-38' },
  ]
};

const measurementTips = [
  {
    title: "Bust Measurement",
    description: "Measure around the fullest part of your bust, keeping the tape parallel to the ground.",
    tip: "Wear a well-fitted bra while measuring for accuracy."
  },
  {
    title: "Waist Measurement", 
    description: "Measure around your natural waistline, which is typically the narrowest part of your torso.",
    tip: "Don't pull the tape too tight - you should be able to fit one finger underneath."
  },
  {
    title: "Hip Measurement",
    description: "Measure around the fullest part of your hips, usually about 7-9 inches below your waistline.",
    tip: "Stand with your feet together for the most accurate measurement."
  }
];

export default function SizeGuide({ productType = "saree" }: SizeGuideProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Ruler className="w-4 h-4 mr-2" />
          Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-blue-600" />
            Size Guide - {productType.charAt(0).toUpperCase() + productType.slice(1)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Saree Information */}
          {productType === "saree" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saree Sizing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Standard Saree Dimensions</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Length: 5.5 - 6.5 meters (18 - 21 feet)</li>
                      <li>• Width: 1.15 - 1.25 meters (45 - 49 inches)</li>
                      <li>• Blouse piece: 0.8 - 1 meter included</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Height Recommendations</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• 5'0" - 5'3": 5.5 meter saree</li>
                      <li>• 5'4" - 5'7": 6 meter saree</li>
                      <li>• 5'8" and above: 6.5 meter saree</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800">
                        Most sarees are one-size-fits-all and can be adjusted during draping. 
                        The key is choosing the right blouse and petticoat size.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blouse Size Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Blouse Size Chart</CardTitle>
              <p className="text-sm text-gray-600">All measurements are in inches</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Size</th>
                      <th className="text-center p-3 font-semibold">Bust</th>
                      <th className="text-center p-3 font-semibold">Waist</th>
                      <th className="text-center p-3 font-semibold">Hip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.blouse.map((size, index) => (
                      <tr 
                        key={size.size}
                        className={`border-b hover:bg-gray-50 cursor-pointer ${
                          selectedSize === size.size ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedSize(selectedSize === size.size ? null : size.size)}
                      >
                        <td className="p-3">
                          <Badge variant={selectedSize === size.size ? "default" : "outline"}>
                            {size.size}
                          </Badge>
                        </td>
                        <td className="text-center p-3">{size.bust}</td>
                        <td className="text-center p-3">{size.waist}</td>
                        <td className="text-center p-3">{size.hip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Petticoat Size Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Petticoat Size Chart</CardTitle>
              <p className="text-sm text-gray-600">All measurements are in inches</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Size</th>
                      <th className="text-center p-3 font-semibold">Waist</th>
                      <th className="text-center p-3 font-semibold">Hip</th>
                      <th className="text-center p-3 font-semibold">Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.petticoat.map((size, index) => (
                      <tr key={size.size} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <Badge variant="outline">{size.size}</Badge>
                        </td>
                        <td className="text-center p-3">{size.waist}</td>
                        <td className="text-center p-3">{size.hip}</td>
                        <td className="text-center p-3">{size.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* How to Measure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Measure</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {measurementTips.map((tip, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {tip.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p className="text-gray-700">{tip.description}</p>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-sm text-yellow-800 font-medium">
                            💡 Tip: {tip.tip}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Care Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Care Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Silk Sarees</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Dry clean only</li>
                    <li>• Store in cotton bags</li>
                    <li>• Avoid direct sunlight</li>
                    <li>• Iron on low heat with cloth</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Cotton Sarees</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Hand wash in cold water</li>
                    <li>• Use mild detergent</li>
                    <li>• Dry in shade</li>
                    <li>• Iron while slightly damp</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact for Custom Sizing */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">Need Custom Sizing?</h3>
              <p className="text-gray-600 mb-4">
                Our tailoring team can create custom-fitted blouses and alterations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Contact Tailor
                </Button>
                <Button variant="outline">
                  Custom Sizing Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
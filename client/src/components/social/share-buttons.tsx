import { useState } from "react";
import { Share2, Facebook, Twitter, Instagram, MessageCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonsProps {
  product?: {
    name: string;
    price: string;
    imageUrl: string;
    id: string;
  };
  url?: string;
  title?: string;
  description?: string;
}

export default function ShareButtons({ 
  product, 
  url = window.location.href, 
  title = "Check out this amazing saree!",
  description = "Beautiful sarees at great prices"
}: ShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = product 
    ? `${window.location.origin}/product/${product.id}`
    : url;
    
  const shareTitle = product 
    ? `${product.name} - Only ₹${product.price}`
    : title;
    
  const shareDescription = product
    ? `Check out this beautiful ${product.name} for just ₹${product.price}! Shop now at our saree collection.`
    : description;

  const shareImage = product?.imageUrl || '';

  const handleShare = async (platform: string) => {
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}&hashtags=saree,fashion,shopping`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${shareUrl}`)}`;
        break;
      case 'instagram':
        toast({
          title: "Instagram sharing",
          description: "Copy the link and share manually on Instagram Stories or posts.",
        });
        handleCopyLink();
        return;
      case 'copy':
        handleCopyLink();
        return;
      default:
        return;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Native share cancelled or failed');
      }
    } else {
      // Fallback to dropdown menu
      return false;
    }
    return true;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Native Share (if supported) */}
        {navigator.share && (
          <>
            <DropdownMenuItem
              onClick={handleNativeShare}
              className="gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Share...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Social Media Platforms */}
        <DropdownMenuItem
          onClick={() => handleShare('whatsapp')}
          className="gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleShare('facebook')}
          className="gap-2 cursor-pointer"
        >
          <Facebook className="w-4 h-4 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleShare('twitter')}
          className="gap-2 cursor-pointer"
        >
          <Twitter className="w-4 h-4 text-sky-500" />
          Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleShare('instagram')}
          className="gap-2 cursor-pointer"
        >
          <Instagram className="w-4 h-4 text-pink-600" />
          Instagram
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleShare('copy')}
          className="gap-2 cursor-pointer"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? 'Copied!' : 'Copy Link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Utility hook for social sharing
export function useSocialShare() {
  const { toast } = useToast();

  const shareProduct = async (product: any, platform?: string) => {
    const url = `${window.location.origin}/product/${product.id}`;
    const title = `${product.name} - Only ₹${product.price}`;
    const description = `Check out this beautiful ${product.name}! Shop now at our exclusive saree collection.`;

    if (platform) {
      // Direct share to specific platform
      let shareLink = '';
      
      switch (platform) {
        case 'whatsapp':
          shareLink = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`;
          break;
        case 'facebook':
          shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
        case 'twitter':
          shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
          break;
      }
      
      if (shareLink) {
        window.open(shareLink, '_blank', 'width=600,height=400');
      }
    } else if (navigator.share) {
      // Use native share API
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Share this link with your friends and family.",
        });
      } catch (error) {
        toast({
          title: "Share failed",
          description: "Unable to share at the moment.",
          variant: "destructive",
        });
      }
    }
  };

  return { shareProduct };
}
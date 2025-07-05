import { useState } from 'react';
import { X, Phone, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  
  // Email/Password form data
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { login, register, sendOTP, verifyOTP } = useAuth();
  const { toast } = useToast();

  const handleOTPLogin = async () => {
    setIsLoading(true);
    
    if (!otpSent) {
      // Send OTP
      const result = await sendOTP(phoneNumber);
      if (result.success) {
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description: `Verification code sent to ${phoneNumber}. Use 123456 for demo.`,
        });
      }
    } else {
      // Verify OTP
      const result = await verifyOTP(phoneNumber, otp);
      if (result.success) {
        onClose();
        setOtpSent(false);
        setPhoneNumber('');
        setOtp('');
      }
    }
    
    setIsLoading(false);
  };

  const handleEmailLogin = async () => {
    setIsLoading(true);
    const result = await login(loginData.email, loginData.password);
    if (result.success) {
      onClose();
      setLoginData({ email: '', password: '' });
    }
    setIsLoading(false);
  };

  const handleEmailRegister = async () => {
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Please ensure passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await register({
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
    });
    
    if (result.success) {
      onClose();
      setRegisterData({ username: '', email: '', password: '', confirmPassword: '' });
    }
    setIsLoading(false);
  };

  const resetForms = () => {
    setOtpSent(false);
    setPhoneNumber('');
    setOtp('');
    setLoginData({ email: '', password: '' });
    setRegisterData({ username: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForms();
      }
    }}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-charcoal">
            Welcome to SareeMart
          </DialogTitle>
          <p className="text-center text-gray-600">
            Sign in to continue shopping
          </p>
        </DialogHeader>

        <Tabs defaultValue="phone" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phone">Phone</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          {/* Phone/OTP Tab */}
          <TabsContent value="phone" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                    disabled={otpSent}
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP (use 123456)"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For demo purposes, use: 123456
                  </p>
                </div>
              )}

              <Button
                onClick={handleOTPLogin}
                disabled={isLoading || !phoneNumber || (otpSent && !otp)}
                className="w-full bg-golden hover:bg-yellow-600 text-charcoal font-semibold"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
                ) : otpSent ? (
                  'Verify OTP'
                ) : (
                  'Send OTP'
                )}
              </Button>

              {otpSent && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                  className="w-full text-sm"
                >
                  Change Phone Number
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login */}
              <TabsContent value="login" className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleEmailLogin}
                  disabled={isLoading || !loginData.email || !loginData.password}
                  className="w-full bg-charcoal hover:bg-gray-800 text-white font-semibold"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </TabsContent>

              {/* Register */}
              <TabsContent value="register" className="space-y-4">
                <div>
                  <Label htmlFor="register-username">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Enter your full name"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleEmailRegister}
                  disabled={isLoading || !registerData.username || !registerData.email || !registerData.password || !registerData.confirmPassword}
                  className="w-full bg-charcoal hover:bg-gray-800 text-white font-semibold"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

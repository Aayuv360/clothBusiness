import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Phone, Mail, Lock, User, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { animatePageEntry } from "@/lib/animations";

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const { user, login, register, sendOTP, verifyOTP } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  // Email/Password form data
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/");
      return;
    }

    if (pageRef.current) {
      animatePageEntry(pageRef.current);
    }
  }, [user, navigate]);

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!otpSent) {
      // Send OTP
      const result = await sendOTP(phoneNumber);
      if (result.success) {
        setOtpSent(true);
      }
    } else {
      // Verify OTP
      const result = await verifyOTP(phoneNumber, otp);
      if (result.success) {
        navigate("/");
      }
    }

    setIsLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(loginData.email, loginData.password);
    if (result.success) {
      navigate("/");
    }

    setIsLoading(false);
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Please ensure passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
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
      navigate("/");
    }

    setIsLoading(false);
  };

  if (user) {
    return null;
  }

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-golden" />
          <h2 className="mt-6 text-3xl font-bold text-charcoal">
            Welcome to SareeMart
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account or create a new one to start shopping
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-charcoal">
              Get Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="phone" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="phone">Phone</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>

              {/* Phone/OTP Tab */}
              <TabsContent value="phone" className="space-y-4 mt-6">
                <form onSubmit={handleOTPLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Mobile Number</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10"
                        disabled={otpSent || isLoading}
                        required
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <div>
                      <Label htmlFor="otp">Verification Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-blue-600 mt-1">
                        For demo purposes, use:{" "}
                        <span className="font-mono font-bold">123456</span>
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !phoneNumber || (otpSent && !otp)}
                    className="w-full bg-golden hover:bg-yellow-600 text-charcoal font-semibold"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
                    ) : otpSent ? (
                      <>
                        Verify OTP
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Send OTP
                        <Phone className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {otpSent && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                      }}
                      className="w-full text-sm text-gray-600"
                    >
                      Change Phone Number
                    </Button>
                  )}
                </form>
              </TabsContent>

              {/* Email Tab */}
              <TabsContent value="email" className="space-y-4 mt-6">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* Login */}
                  <TabsContent value="login" className="space-y-4 mt-4">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">Email Address</Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="Enter your email"
                            value={loginData.email}
                            onChange={(e) =>
                              setLoginData({
                                ...loginData,
                                email: e.target.value,
                              })
                            }
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            value={loginData.password}
                            onChange={(e) =>
                              setLoginData({
                                ...loginData,
                                password: e.target.value,
                              })
                            }
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={
                          isLoading || !loginData.email || !loginData.password
                        }
                        className="w-full bg-charcoal hover:bg-gray-800 text-white font-semibold"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Register */}
                  <TabsContent value="register" className="space-y-4 mt-4">
                    <form onSubmit={handleEmailRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="register-username">Full Name</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-username"
                            type="text"
                            placeholder="Enter your full name"
                            value={registerData.username}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                username: e.target.value,
                              })
                            }
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="register-email">Email Address</Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="Enter your email"
                            value={registerData.email}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                email: e.target.value,
                              })
                            }
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="register-password">Password</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="Create a password (min 6 characters)"
                            value={registerData.password}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                password: e.target.value,
                              })
                            }
                            className="pl-10"
                            minLength={6}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="confirm-password">
                          Confirm Password
                        </Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm your password"
                            value={registerData.confirmPassword}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={
                          isLoading ||
                          !registerData.username ||
                          !registerData.email ||
                          !registerData.password ||
                          !registerData.confirmPassword
                        }
                        className="w-full bg-charcoal hover:bg-gray-800 text-white font-semibold"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4 text-center">
            Why join SareeMart?
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center text-gray-600">
              <div className="w-2 h-2 bg-golden rounded-full mr-3"></div>
              <span>Exclusive access to premium saree collections</span>
            </div>
            <div className="flex items-center text-gray-600">
              <div className="w-2 h-2 bg-golden rounded-full mr-3"></div>
              <span>Easy order tracking and management</span>
            </div>
            <div className="flex items-center text-gray-600">
              <div className="w-2 h-2 bg-golden rounded-full mr-3"></div>
              <span>Personalized recommendations and offers</span>
            </div>
            <div className="flex items-center text-gray-600">
              <div className="w-2 h-2 bg-golden rounded-full mr-3"></div>
              <span>Fast and secure checkout experience</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

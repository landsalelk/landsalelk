"use client"

import { useState } from "react"
import { BoostPaymentModal, VerifyPaymentButton } from "@/components/features/payments/PaymentComponents"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Rocket, ShieldCheck, CreditCard, CheckCircle } from "lucide-react"

export default function PayHereOnsiteTestPage() {
    const [selectedTest, setSelectedTest] = useState<string | null>(null)

    // Mock user data for testing
    const mockUser = {
        id: "test_user_123",
        email: "test@landsale.lk",
        name: "Test User",
        phone: "0771234567"
    }

    const mockProperty = {
        id: "test_property_123",
        title: "Luxury Villa in Colombo"
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
                    <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">PayHere Onsite Checkout Test</h1>
                <p className="text-muted-foreground">
                    Test the new PayHere onsite checkout integration with secure popup payments
                </p>
                <Badge variant="outline" className="mt-3">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Secure & Fast Payments
                </Badge>
            </div>

            <Tabs defaultValue="boost" className="mb-8">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="boost">
                        <Rocket className="w-4 h-4 mr-2" />
                        Boost Listing
                    </TabsTrigger>
                    <TabsTrigger value="verify">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Verify Property
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="boost">
                    <Card>
                        <CardHeader>
                            <CardTitle>Boost Your Listing</CardTitle>
                            <CardDescription>
                                Test the onsite checkout for boosting a property listing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">Test Details</h3>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Property: {mockProperty.title}</li>
                                        <li>• User: {mockUser.name} ({mockUser.email})</li>
                                        <li>• Payment Method: PayHere Onsite Checkout</li>
                                        <li>• Environment: {process.env.NODE_ENV === "development" ? "Sandbox" : "Live"}</li>
                                    </ul>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-amber-900 mb-2">⚠️ Test Mode</h3>
                                    <p className="text-sm text-amber-800">
                                        This is a test environment. Use sandbox credentials for testing.
                                        In production, this will use live PayHere credentials.
                                    </p>
                                </div>

                                <BoostPaymentModal
                                    propertyId={mockProperty.id}
                                    propertyTitle={mockProperty.title}
                                    userId={mockUser.id}
                                    userEmail={mockUser.email}
                                    userName={mockUser.name}
                                    userPhone={mockUser.phone}
                                    useOnsiteCheckout={true}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="verify">
                    <Card>
                        <CardHeader>
                            <CardTitle>Verify Property</CardTitle>
                            <CardDescription>
                                Test the onsite checkout for property verification
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">Test Details</h3>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Property: {mockProperty.title}</li>
                                        <li>• User: {mockUser.name} ({mockUser.email})</li>
                                        <li>• Payment Method: PayHere Onsite Checkout</li>
                                        <li>• Environment: {process.env.NODE_ENV === "development" ? "Sandbox" : "Live"}</li>
                                    </ul>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-amber-900 mb-2">⚠️ Test Mode</h3>
                                    <p className="text-sm text-amber-800">
                                        This is a test environment. Use sandbox credentials for testing.
                                        In production, this will use live PayHere credentials.
                                    </p>
                                </div>

                                <div className="flex justify-center">
                                    <VerifyPaymentButton
                                        propertyId={mockProperty.id}
                                        userId={mockUser.id}
                                        userEmail={mockUser.email}
                                        userName={mockUser.name}
                                        userPhone={mockUser.phone}
                                        useOnsiteCheckout={true}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card>
                <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                    <CardDescription>
                        The new PayHere onsite checkout provides a seamless payment experience
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-blue-600 font-bold">1</span>
                            </div>
                            <h3 className="font-semibold mb-2">Click to Pay</h3>
                            <p className="text-sm text-muted-foreground">
                                Click the payment button to initiate the onsite checkout
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-blue-600 font-bold">2</span>
                            </div>
                            <h3 className="font-semibold mb-2">Secure Popup</h3>
                            <p className="text-sm text-muted-foreground">
                                PayHere checkout opens in a secure popup within your site
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-blue-600 font-bold">3</span>
                            </div>
                            <h3 className="font-semibold mb-2">Instant Confirmation</h3>
                            <p className="text-sm text-muted-foreground">
                                Payment completes instantly and your service is activated
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
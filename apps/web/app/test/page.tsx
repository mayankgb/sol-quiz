"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Define types for quiz data
interface QuizTemplate {
  id: string;
  title: string;
}

interface PracticeQuizData {
  quizId: string;
  title: string;
  customTitle: string;
}

interface PaidQuizData {
  title: string;
  prizeAmount: string;
  description: string;
}

interface CampaignQuizData extends PaidQuizData {
  promotionalLink: string;
  tagline: string;
  brandName: string;
  logo: File | null;
}

interface FormDataType {
  practice: PracticeQuizData;
  paid: PaidQuizData;
  campaign: CampaignQuizData;
}

type QuizType = 'practice' | 'paid' | 'campaign';

export default function CreateQuizDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<QuizType>('practice');
  const [useExistingQuiz, setUseExistingQuiz] = useState<boolean>(true);
  const [prizeAmount, setPrizeAmount] = useState<number>(5);
  const [platformFee, setPlatformFee] = useState<number>(0.15); // 3% of 5 SOL
  const [test, setTest] = useState("");
  const [testarr, setTestArr] = useState<string[]>([])

  function setQuiz(e:boolean) {
    setOpen(e)
    setCurrentTab("practice")
  }
  
  // Demo form data for each tab
  const [formData, setFormData] = useState<FormDataType>({
    practice: {
      quizId: "quiz-001",
      title: "Biology Fundamentals Quiz",
      customTitle: "",
    },
    paid: {
      title: "Weekend Crypto Challenge",
      prizeAmount: "5",
      description: "Test your knowledge and win SOL!",
    },
    campaign: {
        title: "Solana Ecosystem Quiz",
        prizeAmount: "10",
        promotionalLink: "https://example.com/promo",
        tagline: "Learn and earn with Solana!",
        brandName: "CryptoEdu",
        logo: null,
        description: ""
    }
  });
  
  // Mock data for existing quizzes
  const existingQuizzes: QuizTemplate[] = [
    { id: "quiz-001", title: "Biology Fundamentals" },
    { id: "quiz-002", title: "World History" },
    { id: "quiz-003", title: "Advanced Mathematics" },
    { id: "quiz-004", title: "Geography Explorer" },
    { id: "quiz-005", title: "Crypto Basics" },
  ];
  
  const handleCreateQuiz = (): void => {
    if (currentTab === "practice") {
      
      setOpen(false);
      
      // Handle practice quiz creation
    } else {
      // For paid quiz and campaign, show payment dialog
      setPaymentDialogOpen(true);
      console.log(`Creating ${currentTab} quiz:`, formData[currentTab]);
    }
  };
  
  const handleInputChange = <T extends keyof FormDataType>(
    tab: T, 
    field: keyof FormDataType[T], 
    value: string
  ): void => {
    setFormData({
      ...formData,
      [tab]: {
        ...formData[tab],
        [field]: value
      }
    });
    
    // Update platform fee for prize amount changes
    if (field === "prizeAmount") {
      calculatePlatformFee(value);
    }
  };
  
  const calculatePlatformFee = (amount: string): void => {
    const numAmount = parseFloat(amount);
    const fee = numAmount * 0.03;
    setPlatformFee(fee);
    setPrizeAmount(numAmount);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        campaign: {
          ...formData.campaign,
          logo: file
        }
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(e) => setQuiz(e)}>
        <DialogTrigger asChild>
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">Create Quiz</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
            <DialogDescription>
              Create different types of quizzes to engage your audience
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="practice" className="w-full" onValueChange={(value) => setCurrentTab(value as QuizType)}>
            <TabsList className="grid grid-cols-2 mb-4 gap-x-1 px-1">
              <TabsTrigger value="practice">Practice Quiz</TabsTrigger>
              <TabsTrigger value="paid">Prize Pool</TabsTrigger>
             
            </TabsList>
            
            {/* Practice Quiz Tab */}
            <TabsContent value="practice" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="useExisting" className="text-sm">Use existing quiz template?</Label>
                <Switch 
                  id="useExisting" 
                  checked={useExistingQuiz} 
                  onCheckedChange={setUseExistingQuiz}
                />
              </div>
              
              {useExistingQuiz ? (
                <div className="space-y-2">
                  <Label htmlFor="quizId">Select Quiz Template</Label>
                  <Select
                    value={formData.practice.quizId}
                    onOpenChange={(e) =>{
                      if (e) { 
                        console.log(e)
                        if (test.length === 0 ) {
                          console.log("this function is ruin ")
                          setTest("as")
                        }
                        setTestArr((prev) => { 
                          const a = prev.push("asdasdasd")
                          return prev
                        })
                        console.log(test)
                        console.log(testarr)
                      }
                       
                      }}
                    onValueChange={(value) => handleInputChange("practice", "quizId", value)}
                  >
                    <SelectTrigger onClick={() => console.log("everything is working fine")}>
                      <SelectValue placeholder="Select a quiz template" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingQuizzes.map(quiz => (
                        <SelectItem key={quiz.id} value={quiz.id}>
                          {quiz.title}
                          
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              
              <div className="space-y-2">
                <Label htmlFor="quizTitle">Quiz Title</Label>
                <Input 
                  id="quizTitle" 
                  placeholder="Enter quiz title" 
                  value={formData.practice.title}
                  onChange={(e) => handleInputChange("practice", "title", e.target.value)}
                />
              </div>
              
              {!useExistingQuiz && (
                <div className="space-y-2">
                  <Label htmlFor="customTitle">Custom Title (Optional)</Label>
                  <Input 
                    id="customTitle" 
                    placeholder="Custom display title" 
                    value={formData.practice.customTitle}
                    onChange={(e) => handleInputChange("practice", "customTitle", e.target.value)}
                  />
                </div>
              )}
            </TabsContent>
            
            {/* Paid Quiz Tab */}
            <TabsContent value="paid" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paidQuizTitle">Quiz Title</Label>
                <Input 
                  id="paidQuizTitle" 
                  placeholder="Enter prize quiz title" 
                  value={formData.paid.title}
                  onChange={(e) => handleInputChange("paid", "title", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prizeAmount">Prize Amount (in SOL)</Label>
                <Input 
                  id="prizeAmount" 
                  type="number" 
                  min="0.1" 
                  step="0.1" 
                  placeholder="0.0"
                  value={formData.paid.prizeAmount}
                  onChange={(e) => handleInputChange("paid", "prizeAmount", e.target.value)}
                />
                <p className="text-xs text-gray-500">Platform fee: 3% ({platformFee.toFixed(2)} SOL)</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paidDescription">Description</Label>
                <Textarea 
                  id="paidDescription" 
                  placeholder="Describe your prize quiz" 
                  value={formData.paid.description}
                  onChange={(e) => handleInputChange("paid", "description", e.target.value)}
                />
              </div>
            </TabsContent>
            
            {/* Campaign Tab */}
            {/* <TabsContent value="campaign" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaignTitle">Campaign Title</Label>
                <Input 
                  id="campaignTitle" 
                  placeholder="Enter campaign title" 
                  value={formData.campaign.title}
                  onChange={(e) => handleInputChange("campaign", "title", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="campaignPrize">Prize Amount (in SOL)</Label>
                <Input 
                  id="campaignPrize" 
                  type="number" 
                  min="0.1" 
                  step="0.1" 
                  placeholder="0.0"
                  value={formData.campaign.prizeAmount}
                  onChange={(e) => handleInputChange("campaign", "prizeAmount", e.target.value)}
                />
                <p className="text-xs text-gray-500">Platform fee: 3% ({(parseFloat(formData.campaign.prizeAmount) * 0.03).toFixed(2)} SOL)</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input 
                  id="brandName" 
                  placeholder="Enter brand name" 
                  value={formData.campaign.brandName}
                  onChange={(e) => handleInputChange("campaign", "brandName", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input 
                  id="tagline" 
                  placeholder="Enter campaign tagline" 
                  value={formData.campaign.tagline}
                  onChange={(e) => handleInputChange("campaign", "tagline", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="promoLink">Promotional Link</Label>
                <Input 
                  id="promoLink" 
                  placeholder="https://example.com" 
                  value={formData.campaign.promotionalLink}
                  onChange={(e) => handleInputChange("campaign", "promotionalLink", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo">Brand Logo</Label>
                <div className="border border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50">
                  <input
                    type="file"
                    id="logo"
                    className="hidden"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="logo" className="cursor-pointer block">
                    <p className="text-sm text-gray-500">Click to upload logo</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG or SVG (max 2MB)</p>
                    {formData.campaign.logo && (
                      <p className="text-sm text-green-600 mt-2">
                        {formData.campaign.logo.name} selected
                      </p>
                    )}
                  </label>
                </div>
              </div>
            </TabsContent> */}
          </Tabs>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" className="mr-2" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateQuiz}>
              Create Quiz
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <AlertDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription asChild>
                <div>
                Please confirm the following payment details:
              <div className="mt-4 space-y-2 bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between">
                  <span>Prize Amount:</span>
                  <span className="font-medium">{prizeAmount.toFixed(2)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (3%):</span>
                  <span className="font-medium">{platformFee.toFixed(2)} SOL</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">{(prizeAmount + platformFee).toFixed(2)} SOL</span>
                </div>
              </div>
                </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => {
                setPaymentDialogOpen(false);
                setOpen(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Click to Pay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
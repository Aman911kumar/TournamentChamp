import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Transaction } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { TransactionItem } from "@/components/transaction-item";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

const transactionSchema = z.object({
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  method: z.string().min(1, "Payment method is required"),
});

export default function WalletPage() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Forms
  const depositForm = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      method: "UPI",
    },
  });

  const withdrawForm = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      method: "Bank Transfer",
    },
  });

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string }) => {
      const res = await apiRequest("POST", "/api/transactions/deposit", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit successful",
        description: "Your account has been credited",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsDepositOpen(false);
      depositForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Deposit failed",
        description: error.message || "An error occurred while processing your deposit",
        variant: "destructive",
      });
    }
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string }) => {
      const res = await apiRequest("POST", "/api/transactions/withdraw", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal successful",
        description: "Your withdrawal request has been processed",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsWithdrawOpen(false);
      withdrawForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal failed",
        description: error.message || "An error occurred while processing your withdrawal",
        variant: "destructive",
      });
    }
  });

  // Handle deposit
  const handleDeposit = (formData: z.infer<typeof transactionSchema>) => {
    depositMutation.mutate({
      amount: Number(formData.amount),
      method: formData.method,
    });
  };

  // Handle withdraw
  const handleWithdraw = (formData: z.infer<typeof transactionSchema>) => {
    withdrawMutation.mutate({
      amount: Number(formData.amount),
      method: formData.method,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      {/* Header */}
      <header className="bg-primary-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button className="mr-2" onClick={() => navigate("/")}>
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <h1 className="text-lg font-bold">Wallet</h1>
        </div>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/transactions"] })}>
          <i className="ri-refresh-line text-xl"></i>
        </button>
      </header>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-secondary-800 to-secondary-600 m-4 rounded-xl p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-white/80 text-sm">Your Balance</p>
            <h2 className="text-3xl font-bold text-white">₹{user?.balance?.toFixed(2) || '0.00'}</h2>
          </div>
          <div className="bg-white/20 p-2 rounded-full">
            <i className="ri-wallet-3-line text-white text-xl"></i>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button 
            className="bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
            onClick={() => setIsDepositOpen(true)}
          >
            <i className="ri-add-line"></i>
            <span>Add Money</span>
          </button>
          <button 
            className="bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
            onClick={() => setIsWithdrawOpen(true)}
          >
            <i className="ri-arrow-right-up-line"></i>
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2 mx-4 mb-6">
        <div 
          className="bg-primary-50 rounded-xl p-3 flex flex-col items-center cursor-pointer"
          onClick={() => navigate("/tournaments")}
        >
          <div className="bg-primary-900 p-2 rounded-full mb-2">
            <i className="ri-trophy-line text-secondary text-xl"></i>
          </div>
          <span className="text-xs text-center">Join Tournament</span>
        </div>
        <div className="bg-primary-50 rounded-xl p-3 flex flex-col items-center cursor-pointer">
          <div className="bg-primary-900 p-2 rounded-full mb-2">
            <i className="ri-copper-coin-line text-yellow-400 text-xl"></i>
          </div>
          <span className="text-xs text-center">Rewards</span>
        </div>
        <div className="bg-primary-50 rounded-xl p-3 flex flex-col items-center cursor-pointer">
          <div className="bg-primary-900 p-2 rounded-full mb-2">
            <i className="ri-history-line text-blue-400 text-xl"></i>
          </div>
          <span className="text-xs text-center">History</span>
        </div>
      </div>

      {/* Main Content Area with Scrolling */}
      <main className="flex-1 overflow-y-auto pb-16">
        {/* Transaction History */}
        <div className="px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold font-rajdhani">Transaction History</h2>
            <button className="text-secondary text-sm">Filter</button>
          </div>
          
          {transactionsLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-full h-16 rounded-xl" />
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map(transaction => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          ) : (
            <div className="bg-primary-50 rounded-xl p-6 text-center">
              <p className="text-gray-400">No transactions yet</p>
              <p className="text-gray-500 text-sm mt-1">Your transaction history will appear here</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Deposit Dialog */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="bg-primary-50 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Add Money to Wallet</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose your payment method and enter the amount to deposit.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...depositForm}>
            <form onSubmit={depositForm.handleSubmit(handleDeposit)} className="space-y-4">
              <FormField
                control={depositForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="Enter amount" 
                        className="bg-primary border-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={depositForm.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <select 
                        {...field} 
                        className="w-full bg-primary border border-gray-700 rounded-md px-4 py-2.5 text-white"
                      >
                        <option value="UPI">UPI</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Net Banking">Net Banking</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDepositOpen(false)}
                  className="border-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-secondary hover:bg-secondary-600"
                  disabled={depositMutation.isPending}
                >
                  {depositMutation.isPending ? "Processing..." : "Add Money"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="bg-primary-50 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Withdraw Money</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the amount you want to withdraw and select the method.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...withdrawForm}>
            <form onSubmit={withdrawForm.handleSubmit(handleWithdraw)} className="space-y-4">
              <FormField
                control={withdrawForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="Enter amount" 
                        className="bg-primary border-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={withdrawForm.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Withdrawal Method</FormLabel>
                    <FormControl>
                      <select 
                        {...field} 
                        className="w-full bg-primary border border-gray-700 rounded-md px-4 py-2.5 text-white"
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Wallet">E-Wallet</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsWithdrawOpen(false)}
                  className="border-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-secondary hover:bg-secondary-600"
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

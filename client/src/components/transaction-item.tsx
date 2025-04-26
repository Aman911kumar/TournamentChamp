import React from "react";
import { Transaction } from "@shared/schema";
import { format } from "date-fns";

export function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isPositive = transaction.amount > 0;
  
  const getIconClass = () => {
    if (isPositive) {
      return "ri-arrow-down-line text-green-500";
    } else {
      return "ri-arrow-up-line text-red-500";
    }
  };
  
  const getBackgroundClass = () => {
    if (isPositive) {
      return "bg-green-500/20";
    } else {
      return "bg-red-500/20";
    }
  };
  
  const getAmountClass = () => {
    if (isPositive) {
      return "text-green-500";
    } else {
      return "text-red-500";
    }
  };
  
  const getFormattedAmount = () => {
    const prefix = isPositive ? "+" : "";
    return `${prefix}₹${Math.abs(transaction.amount)}`;
  };
  
  const getFormattedDate = (date: Date) => {
    return format(new Date(date), "MMM d, yyyy • h:mm a");
  };

  return (
    <div className="bg-primary-50 rounded-xl p-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`${getBackgroundClass()} p-2 rounded-full mr-3`}>
            <i className={getIconClass()}></i>
          </div>
          <div>
            <h3 className="font-medium">{transaction.description}</h3>
            <p className="text-xs text-gray-400">{getFormattedDate(transaction.timestamp)}</p>
          </div>
        </div>
        <div className={`font-medium ${getAmountClass()}`}>{getFormattedAmount()}</div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, aiActions } from '../store';
import { AIConversation, AIMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Send, Plus, Bot, User, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { formatCurrency, calculateNetWorth, calculateCashFlow, getCurrentMonth } from '../utils/calculations';

// AI Response Generator - educational financial content
function generateAIResponse(userMessage: string, context: AIContext): string {
  const msg = userMessage.toLowerCase();

  // Budget-related
  if (msg.includes('budget') && (msg.includes('how') || msg.includes('create') || msg.includes('start'))) {
    return `## Creating a Budget\n\nHere's a proven approach to budgeting:\n\n**1. The 50/30/20 Rule:**\n- 50% for needs (housing, food, utilities, insurance)\n- 30% for wants (entertainment, dining out, shopping)\n- 20% for savings and debt repayment\n\n**2. Steps to Create Your Budget:**\n- Track all income sources\n- List fixed expenses (rent, insurance, loan payments)\n- Estimate variable expenses (food, transport, entertainment)\n- Set spending limits for each category\n- Review and adjust monthly\n\n**Based on your profile:** Your monthly income is ${formatCurrency(context.monthlyIncome)} with estimated expenses of ${formatCurrency(context.monthlyExpenses)}. I recommend setting specific category limits in the Budgets section to track your spending.\n\n*Note: This is educational information, not personalized financial advice. Consider consulting a financial planner for advice specific to your situation.*`;
  }

  // Savings rate
  if (msg.includes('savings') && (msg.includes('rate') || msg.includes('how much'))) {
    const rate = context.monthlyIncome > 0 ? ((context.monthlyIncome - context.monthlyExpenses) / context.monthlyIncome * 100).toFixed(1) : '0';
    return `## Your Savings Rate\n\nYour current savings rate is approximately **${rate}%**.\n\n**What is a good savings rate?**\n- Below 10%: Room for improvement\n- 10-20%: Good for most people\n- 20-30%: Above average, great progress\n- Above 30%: Excellent, on track for early financial independence\n\n**Tips to improve your savings rate:**\n1. Automate transfers to savings on payday\n2. Review subscriptions and cancel unused ones\n3. Cook at home more often\n4. Use the 24-hour rule for non-essential purchases\n5. Increase income through side projects or career advancement\n\n*Note: Financial situations vary. This is general educational information.*`;
  }

  // Emergency fund
  if (msg.includes('emergency') && msg.includes('fund')) {
    const monthsCovered = context.monthlyExpenses > 0 ? (context.emergencyFund / context.monthlyExpenses).toFixed(1) : 'N/A';
    return `## Emergency Fund\n\n**What is an emergency fund?**\nA cash reserve set aside for unexpected expenses like job loss, medical bills, or major repairs.\n\n**Your current status:**\n- Emergency fund: ${formatCurrency(context.emergencyFund)}\n- Estimated coverage: ${monthsCovered} months of expenses\n\n**General recommendations:**\n- Minimum: 3-6 months of essential expenses\n- Conservative: 6-12 months\n- Consider your job stability, dependents, and insurance coverage\n\n**Where to keep it:**\n- High-yield savings account (liquid, earns interest)\n- Money market account\n- Not in investments (too volatile) or checking (too tempting to spend)\n\n*Note: This is educational information. Your specific needs may vary based on personal circumstances.*`;
  }

  // Investing basics
  if (msg.includes('invest') || msg.includes('portfolio') || msg.includes('stock')) {
    return `## Investment Basics\n\n**Key Principles:**\n1. **Diversification** - Don't put all your money in one investment\n2. **Time horizon** - Longer periods allow for more risk\n3. **Cost matters** - Low-cost index funds often outperform expensive active management\n4. **Consistency** - Regular contributions beat trying to time the market\n\n**Common investment types:**\n- **Stocks/ETFs**: Ownership in companies, higher growth potential\n- **Bonds**: Loans to governments/companies, lower risk, steady income\n- **Index Funds**: Baskets of stocks, instant diversification\n- **Real Estate**: Physical property or REITs\n\n**Your risk tolerance:** ${context.riskTolerance}\n- Conservative: More bonds, fewer stocks\n- Moderate: Balanced mix (60/40 stocks/bonds)\n- Aggressive: More stocks, growth-focused\n\n**Important:** Past performance doesn't guarantee future results. Never invest money you'll need in the short term.\n\n*Note: This is educational information, not investment advice. Consider consulting a licensed financial advisor.*`;
  }

  // Net worth
  if (msg.includes('net worth') || msg.includes('worth')) {
    return `## Understanding Net Worth\n\n**Net Worth = Total Assets - Total Liabilities**\n\n**Your current position:**\n- Total Assets: ${formatCurrency(context.totalAssets)}\n- Total Liabilities: ${formatCurrency(context.totalLiabilities)}\n- **Net Worth: ${formatCurrency(context.netWorth)}**\n\n**Why track net worth?**\n- It's the most comprehensive measure of financial health\n- Shows the combined effect of saving, investing, and debt repayment\n- Helps you see progress over time\n\n**How to increase net worth:**\n1. Increase income and save the difference\n2. Invest consistently over time\n3. Pay down high-interest debt\n4. Avoid lifestyle inflation\n5. Protect against major losses (insurance, emergency fund)\n\n*Note: Net worth is a snapshot. Focus on the trend over time rather than any single number.*`;
  }

  // Debt
  if (msg.includes('debt') && (msg.includes('pay') || msg.includes('reduce') || msg.includes('strategy'))) {
    return `## Debt Repayment Strategies\n\n**Two popular methods:**\n\n**1. Debt Avalanche (mathematically optimal):**\n- Pay minimums on all debts\n- Put extra money toward the highest interest rate debt\n- Saves the most money over time\n\n**2. Debt Snowball (psychologically motivating):**\n- Pay minimums on all debts\n- Put extra money toward the smallest balance first\n- Quick wins build momentum\n\n**General debt principles:**\n- Prioritize high-interest debt (credit cards, personal loans)\n- Don't neglect minimum payments on other debts\n- Consider refinancing if rates have dropped\n- Avoid taking on new debt while repaying existing debt\n\n**Good debt vs. bad debt:**\n- Good: Mortgage, student loans (investing in your future)\n- Bad: High-interest credit card debt, payday loans\n\n*Note: For complex debt situations, consider consulting a credit counselor or financial advisor.*`;
  }

  // Spending analysis
  if (msg.includes('spend') || msg.includes('expense')) {
    return `## Spending Analysis\n\n**Based on your current data:**\n- Monthly expenses: ${formatCurrency(context.monthlyExpenses)}\n- This represents ${context.monthlyIncome > 0 ? ((context.monthlyExpenses / context.monthlyIncome) * 100).toFixed(0) : 'N/A'}% of your income\n\n**Tips for managing expenses:**\n1. **Track everything** - Use the Transactions page to categorize all spending\n2. **Identify patterns** - Look for recurring expenses that can be reduced\n3. **Needs vs. wants** - Question each discretionary expense\n4. **Set category budgets** - Use the Budgets feature to set limits\n5. **Review weekly** - Quick check-ins prevent surprises\n\n**Common areas to optimize:**\n- Subscriptions (cancel unused ones)\n- Dining out vs. cooking at home\n- Transportation costs\n- Energy usage\n- Impulse purchases\n\n*Tip: Try the "30-day rule" - wait 30 days before making non-essential purchases over a certain amount.*`;
  }

  // Goals
  if (msg.includes('goal') || msg.includes('target') || msg.includes('save for')) {
    return `## Financial Goal Setting\n\n**SMART Goals Framework:**\n- **Specific**: Define exactly what you're saving for\n- **Measurable**: Set a concrete dollar amount\n- **Achievable**: Make sure it's realistic given your income\n- **Relevant**: Align with your life priorities\n- **Time-bound**: Set a deadline\n\n**Your active goals:** ${context.goalsCount} goals tracked\n\n**Tips for achieving goals:**\n1. Automate contributions - set up automatic transfers\n2. Start with smaller goals to build confidence\n3. Celebrate milestones along the way\n4. Adjust timelines when life changes\n5. Keep your "why" visible - motivation matters\n\n**Priority framework:**\n1. Emergency fund (3-6 months expenses)\n2. Employer 401(k) match (free money!)\n3. High-interest debt\n4. Other goals (home, education, retirement)\n\n*Note: Goals should be flexible. Life changes, and that's okay.*`;
  }

  // Default response
  return `## FinPilot AI Assistant\n\nI can help you with various financial topics:\n\n- 💰 **Budgeting** - "How do I create a budget?"\n- 🏦 **Savings** - "What's a good savings rate?"\n- 🛡️ **Emergency Fund** - "How much should I save for emergencies?"\n- 📈 **Investing** - "What are investment basics?"\n- 💳 **Debt** - "What's the best debt repayment strategy?"\n- 📊 **Net Worth** - "How do I calculate my net worth?"\n- 🎯 **Goals** - "How do I set financial goals?"\n- 💸 **Spending** - "How can I reduce my expenses?"\n\nI also have access to your financial data (income, expenses, accounts, goals) to provide context-specific insights.\n\n**What would you like to know?**\n\n*Disclaimer: I provide educational financial information. For specific investment, tax, or legal advice, please consult qualified professionals.*`;
}

interface AIContext {
  monthlyIncome: number;
  monthlyExpenses: number;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  emergencyFund: number;
  riskTolerance: string;
  goalsCount: number;
}

export default function AIAssistantPage() {
  const dispatch = useDispatch();
  const darkMode = useSelector((s: RootState) => s.ui.darkMode);
  const conversations = useSelector((s: RootState) => s.ai.data);
  const activeId = useSelector((s: RootState) => s.ai.activeConversationId);
  const transactions = useSelector((s: RootState) => s.transactions.data);
  const accounts = useSelector((s: RootState) => s.accounts.data);
  const goals = useSelector((s: RootState) => s.goals.data);
  const profile = useSelector((s: RootState) => s.profile.data);
  const userId = useSelector((s: RootState) => s.auth.user?.id || '');

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeId);
  const { totalAssets, totalLiabilities, netWorth } = calculateNetWorth(accounts);
  const currentMonth = getCurrentMonth();
  const { income, expenses } = calculateCashFlow(transactions, currentMonth);

  const context: AIContext = {
    monthlyIncome: income,
    monthlyExpenses: expenses,
    netWorth,
    totalAssets,
    totalLiabilities,
    emergencyFund: profile?.emergencyFund || 0,
    riskTolerance: profile?.riskTolerance || 'moderate',
    goalsCount: goals.length
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleNewConversation = () => {
    const newConv: AIConversation = {
      id: uuidv4(), userId, title: 'New Conversation', messages: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    dispatch(aiActions.addConversation(newConv));
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    let convId = activeId;
    if (!convId) {
      const newConv: AIConversation = {
        id: uuidv4(), userId, title: input.slice(0, 40), messages: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      dispatch(aiActions.addConversation(newConv));
      convId = newConv.id;
    }

    const userMsg: AIMessage = { id: uuidv4(), role: 'user', content: input, timestamp: new Date().toISOString() };
    dispatch(aiActions.addMessage({ conversationId: convId, message: userMsg }));

    // Generate AI response
    const response = generateAIResponse(input, context);
    const aiMsg: AIMessage = { id: uuidv4(), role: 'assistant', content: response, timestamp: new Date().toISOString() };
    
    setTimeout(() => {
      dispatch(aiActions.addMessage({ conversationId: convId!, message: aiMsg }));
    }, 500);

    setInput('');
  };

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-bold mt-3 mb-1">{line.slice(3)}</h3>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold mt-2">{line.slice(2, -2)}</p>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}</li>;
      if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) return <p key={i} className="text-xs italic text-gray-500 mt-2">{line.slice(1, -1)}</p>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="mt-1">{line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>;
    });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar - Conversations */}
      <div className={`hidden md:flex flex-col w-64 border rounded-xl ${cardClass} overflow-hidden`}>
        <div className="p-3 border-b dark:border-gray-700">
          <button onClick={handleNewConversation} className="w-full flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
            <Plus size={16} /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conv => (
            <div key={conv.id} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm ${
              conv.id === activeId ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`} onClick={() => dispatch(aiActions.setActiveConversation(conv.id))}>
              <div className="flex items-center gap-2 truncate">
                <MessageSquare size={14} />
                <span className="truncate">{conv.title}</span>
              </div>
              <button onClick={e => { e.stopPropagation(); dispatch(aiActions.deleteConversation(conv.id)); }} className="p-1 hover:text-red-500">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {conversations.length === 0 && <p className="text-xs text-gray-400 text-center p-4">No conversations yet</p>}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col border rounded-xl ${cardClass} overflow-hidden`}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeConversation ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot size={48} className="text-emerald-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">FinPilot AI Assistant</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} max-w-md`}>
                I can help you understand financial concepts, analyze your spending, explain investment basics, and more. Start a conversation or ask me anything!
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
                {['How do I create a budget?', 'What\'s my savings rate?', 'Explain emergency funds', 'Investment basics'].map(q => (
                  <button key={q} onClick={() => { setInput(q); }} className={`px-3 py-2 text-sm rounded-lg border text-left ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {activeConversation.messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-emerald-600" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white' 
                      : darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    {msg.role === 'assistant' ? renderContent(msg.content) : <p className="text-sm">{msg.content}</p>}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-blue-600" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about budgets, savings, investing..."
              className={`flex-1 px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`}
            />
            <button onClick={handleSend} disabled={!input.trim()} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg">
              <Send size={18} />
            </button>
          </div>
          <div className={`flex items-center gap-1 mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'} text-xs`}>
            <AlertCircle size={12} />
            <span>Educational information only. Not financial advice. Consult a professional for personalized guidance.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

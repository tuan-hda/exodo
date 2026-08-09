import {
  Airplane,
  ArrowCounterClockwise,
  ArrowsClockwise,
  Basket,
  Briefcase,
  BowlFood,
  Car,
  DotsThree,
  GameController,
  Gift,
  GraduationCap,
  Heart,
  House,
  Laptop,
  PawPrint,
  Receipt,
  ShoppingBag,
  Trophy,
  Wallet,
} from '@phosphor-icons/react'

export type Category = string

export const expenseCategories: Category[] = ['Food', 'Groceries', 'Home', 'Transport', 'Health', 'Fun', 'Shopping', 'Subscriptions', 'Bills', 'Travel', 'Education', 'Pets', 'Gifts', 'Work', 'Other']
export const incomeCategories: Category[] = ['Salary', 'Freelance', 'Bonus', 'Refund', 'Other']

export function categoryIcon(category: Category, size = 18) {
  const props = { size, weight: 'regular' as const }
  switch (category) {
    case 'Food': return <BowlFood {...props} />
    case 'Groceries': return <Basket {...props} />
    case 'Home': return <House {...props} />
    case 'Transport': return <Car {...props} />
    case 'Health': return <Heart {...props} />
    case 'Fun': return <GameController {...props} />
    case 'Shopping': return <ShoppingBag {...props} />
    case 'Subscriptions': return <ArrowsClockwise {...props} />
    case 'Bills': return <Receipt {...props} />
    case 'Travel': return <Airplane {...props} />
    case 'Education': return <GraduationCap {...props} />
    case 'Pets': return <PawPrint {...props} />
    case 'Gifts': return <Gift {...props} />
    case 'Work': return <Briefcase {...props} />
    case 'Salary': return <Wallet {...props} />
    case 'Freelance': return <Laptop {...props} />
    case 'Bonus': return <Trophy {...props} />
    case 'Refund': return <ArrowCounterClockwise {...props} />
    default: return <DotsThree {...props} />
  }
}

export function CategoryPicker({ type, value, onChange }: { type: 'income' | 'expense'; value: Category; onChange: (category: Category) => void }) {
  const options = type === 'expense' ? expenseCategories : incomeCategories
  return <div className="category-picker"><div className="category-picker-heading"><span>Category</span><span className="category-selected">{categoryIcon(value, 14)} {value}</span></div><div className="category-grid">{options.map(item => <button key={item} type="button" className={`category-button ${value === item ? 'selected' : ''}`} aria-label={item} title={item} aria-pressed={value === item} onClick={() => onChange(item)}>{categoryIcon(item)}</button>)}</div></div>
}

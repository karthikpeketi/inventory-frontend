import { Check, X } from 'lucide-react';
import { calculatePasswordStrength, getStrengthColor, getStrengthBarColor } from '../../utils/passwordStrength';

const PasswordStrengthIndicator = ({ password, showCriteria = true }) => {
  const { strength, score, label, criteria } = calculatePasswordStrength(password);
  
  if (!password) return null;

  const strengthColor = getStrengthColor(strength);
  const barColor = getStrengthBarColor(strength);

  return (
    <div className="space-y-3">
      {/* Strength Label and Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${strengthColor}`}>
            {label}
          </span>
        </div>
        
        {/* Strength Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${(score / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Criteria Checklist - Only show requirements for medium strength */}
      {showCriteria && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Requirements:</h4>
          <div className="space-y-1">
            <CriteriaItem 
              met={criteria.length} 
              text="At least 6 characters long" 
            />
            <CriteriaItem 
              met={criteria.uppercase} 
              text="Contains uppercase letter (A-Z)" 
            />
            <CriteriaItem 
              met={criteria.number} 
              text="Contains number (0-9)" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

const CriteriaItem = ({ met, text }) => (
  <div className="flex items-center gap-2 text-sm">
    {met ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-gray-400" />
    )}
    <span className={met ? 'text-green-700' : 'text-gray-500'}>
      {text}
    </span>
  </div>
);

export default PasswordStrengthIndicator;
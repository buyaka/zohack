'use client';
import { useState } from 'react';
import { ChevronLeft, Delete } from 'lucide-react';
import Image from 'next/image';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const tAuth = {
  mn: {
    loginTitle: 'Нэвтрэх',
    phoneToken: 'Дугаар',
    emailToken: 'И-мэйл',
    passToken: 'Нууц үг',
    forgotPass: 'Нууц үг мартсан?',
    loginBtn: 'Нэвтрэх',
    newUser: 'Шинэ хэрэглэгч үү?',
    registerLink: 'Бүртгүүлэх',
    forgotTitle: 'Нууц үг сэргээх үү?',
    forgotDesc: 'Баталгаажуулах кодыг хүлээн авах утас эсвэл и-мэйл хаягаа оруулна уу.',
    continueBtn: 'Үргэлжлүүлэх',
    verifyTitle: 'Баталгаажуулах',
    verifyDesc: 'Дугаарт ирсэн баталгаажуулах кодоо оруулна уу.',
    resendCode: 'Дахин код авах',
    resetTitle: 'Нууц үг шинэчлэх',
    newPass: 'Шинэ нууц үг оруулах',
    rePass: 'Нууц үг давтан оруулах',
    registerTitle: 'Бүртгүүлэх',
    regNum: 'Регистрийн дугаар',
    lastName: 'Овгоо оруулна уу',
    firstName: 'Нэрээ оруулна уу',
    district: 'Амьдардаг дүүрэг',
    districtSelect: 'Дүүрэг сонгох',
    agreeTerms: 'Үйлчилгээний нөхцөлийг зөвшөөрч байна',
    consentTitle: 'ХУВИЙН МЭДЭЭЛЭЛ БОЛОВСРУУЛАХ ЗӨВШӨӨРӨЛ',
    consentText: 'Нэг. Нийтлэг үндэслэл\n1.1 Энэхүү зөвшөөрлийн зорилго нь хэрэглэгчийг платформд бүртгэх, насны шалгуур баталгаажуулах, бүртгэлийн мэдээллийг боловсруулахтай холбоотой харилцааг зохицуулахад оршино.\n1.2 Хэрэглэгч бүртгүүлэхдээ энэхүү зөвшөөрлийн нөхцөлтэй танилцаж, зөвшөөрсөнд тооцно.\n\nХоёр. Цуглуулах мэдээлэл\n2.1 Платформ нь бүртгэлийн явцад дараах мэдээллийг авч болно:\n• Регистрийн дугаар\n• Овог, нэр\n• Оршин суугаа хаяг\n• Утасны дугаар\n• И-мэйл хаяг',
    cancelBtn: 'Болих',
    agreeBtn: 'Зөвшөөрөх',
    welcome: 'Тавтай морил',
    errEmailInUse: 'Энэ и-мэйл хаягаар аль хэдийн бүртгүүлсэн байна.',
    errInvalidEmail: 'Та и-мэйл хаягаа зөв оруулна уу.',
    errWrongPassword: 'Нууц үг эсвэл и-мэйл буруу байна.',
    errUserNotFound: 'Бүртгэлтэй хэрэглэгч олдсонгүй.',
    errWeakPassword: 'Нууц үг хэт богино (дор хаяж 6 тэмдэгт).',
    errDefault: 'Алдаа гарлаа. Та дахин оролдоно уу.'
  },
  en: {
    loginTitle: 'Login',
    phoneToken: 'Number',
    emailToken: 'Email',
    passToken: 'Password',
    forgotPass: 'Forgot password?',
    loginBtn: 'Login',
    newUser: 'New user?',
    registerLink: 'Register',
    forgotTitle: 'Recover password?',
    forgotDesc: 'Enter your phone number or email address to receive a verification code.',
    continueBtn: 'Continue',
    verifyTitle: 'Verification',
    verifyDesc: 'Enter the verification code sent to your number.',
    resendCode: 'Get code again',
    resetTitle: 'Update password',
    newPass: 'Enter new password',
    rePass: 'Re-enter password',
    registerTitle: 'Register',
    regNum: 'Registration no',
    lastName: 'Enter surname',
    firstName: 'Enter first name',
    district: 'Living district',
    districtSelect: 'Select district',
    agreeTerms: 'I agree to the terms of service',
    consentTitle: 'CONSENT TO PROCESS DATA',
    consentText: 'One. General grounds\n1.1 The purpose of this consent is to register the user on the platform, verify age criteria, and regulate relations related to processing registration information.\n1.2 When registering, the user is considered to have read and agreed to the terms.\n\nTwo. Information to collect\n2.1 The platform may collect the following info:\n• Registration number\n• Name\n• Address\n• Phone\n• Email',
    cancelBtn: 'Cancel',
    agreeBtn: 'Agree',
    welcome: 'Welcome',
    errEmailInUse: 'This email is already registered.',
    errInvalidEmail: 'Please enter a valid email address.',
    errWrongPassword: 'Incorrect email or password.',
    errUserNotFound: 'User not found.',
    errWeakPassword: 'Password is too weak (minimum 6 characters).',
    errDefault: 'An error occurred. Please try again.'
  }
};

const getErrorMessage = (error: any, t: typeof tAuth['mn']) => {
  const code = error?.code || '';
  if (code === 'auth/email-already-in-use') return t.errEmailInUse;
  if (code === 'auth/invalid-email') return t.errInvalidEmail;
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') return t.errWrongPassword;
  if (code === 'auth/user-not-found') return t.errUserNotFound;
  if (code === 'auth/weak-password') return t.errWeakPassword;
  return t.errDefault + (error?.message ? ` (${error.message})` : '');
};

type Step = 'login' | 'forgot' | 'verify' | 'reset' | 'register_step1' | 'register_step2' | 'consent' | 'welcome';

const Numpad = ({ onNumpadPress, isDark }: { onNumpadPress: (val: string) => void, isDark: boolean }) => (
  <div className="grid grid-cols-3 gap-y-7 gap-x-12 mt-6 px-8 text-2xl font-light">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
      <button key={num} onClick={() => onNumpadPress(String(num))} className={`flex items-center justify-center p-4 rounded-full active:bg-white/10 transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
        {num}
      </button>
    ))}
    <div></div>
    <button onClick={() => onNumpadPress('0')} className={`flex items-center justify-center p-4 rounded-full active:bg-white/10 transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
      0
    </button>
    <button onClick={() => onNumpadPress('back')} className={`flex items-center justify-center p-4 rounded-full active:bg-white/10 transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
      <Delete size={28} />
    </button>
  </div>
);

export default function AuthFlow({ 
  onComplete, 
  isDark, 
  lang,
  setIsDark,
  setLang
}: { 
  onComplete: () => void, 
  isDark: boolean, 
  lang: 'mn' | 'en',
  setIsDark: (val: boolean) => void,
  setLang: (val: 'mn' | 'en') => void
}) {
  const t = tAuth[lang];
  const [step, setStep] = useState<Step>('login');
  const [method, setMethod] = useState<'phone' | 'email'>('email'); // Default to email, hide phone for now
  
  const [phoneVal, setPhoneVal] = useState('');
  const [emailVal, setEmailVal] = useState('');
  const [passVal, setPassVal] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const handleLogin = async () => {
    setLoading(true);
    setLoginError(null);
    try {
        await signInWithEmailAndPassword(auth, emailVal, passVal);
        onComplete();
    } catch (error: any) {
        setLoginError(getErrorMessage(error, t));
    } finally {
        setLoading(false);
    }
  };

  const handleRegister = async () => {
    console.log('Register attempt started', { email: emailVal });
    setLoading(true);
    try {
        await createUserWithEmailAndPassword(auth, emailVal, passVal);
        console.log('Registration success');
        setStep('welcome');
    } catch (error: any) {
        console.error('Registration error:', error);
        alert(getErrorMessage(error, t));
    } finally {
        setLoading(false);
    }
  };
  
  // Custom back handler
  const handleBack = () => {
    if (step === 'forgot' || step === 'register_step1') setStep('login');
    else if (step === 'verify') setStep('forgot');
    else if (step === 'reset') setStep('verify');
    else if (step === 'register_step2') setStep('register_step1');
    else if (step === 'consent') setStep('register_step2');
    else if (step === 'welcome') setStep('login');
  };

  const onNumpadPress = (val: string) => {
    if (step === 'verify') {
      if (val === 'back') {
        setVerifyCode(prev => prev.slice(0, -1));
      } else {
        if (verifyCode.length < 4) setVerifyCode(prev => prev + val);
      }
    } else {
      if (val === 'back') {
        setPhoneVal(prev => prev.slice(0, -1));
      } else {
        setPhoneVal(prev => prev + val);
      }
    }
  };

  const inputClass = `w-full bg-transparent border rounded-2xl px-5 py-4 text-[15px] outline-none transition-colors ${isDark ? 'border-white/10 text-white placeholder-slate-500 focus:border-blue-500' : 'border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'} mb-5`;

  if (step === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 animate-in fade-in zoom-in duration-500">
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden mb-8 relative bg-gradient-to-br from-blue-300 to-blue-600 p-1 flex items-center justify-center shadow-[0_0_40px_rgba(24,119,242,0.3)]">
           <div className="w-full h-full bg-[#0a1128] rounded-full flex items-center justify-center text-4xl">👋</div>
        </div>
        <h2 className={`text-4xl font-semibold mb-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.welcome}</h2>
        <button onClick={onComplete} className="w-full bg-[#1877f2] hover:bg-blue-600 text-white py-4 rounded-full font-medium text-[16px] transition-transform active:scale-[0.98]">
           {t.continueBtn}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto">
      {/* Top Header */}
      <div className="px-5 py-6 pt-10 flex items-center justify-between">
        <div>
          {step !== 'login' && (
            <button onClick={handleBack} className={`p-2 -ml-2 rounded-full transition-colors ${isDark ? 'text-blue-500 hover:bg-white/5' : 'text-blue-600 hover:bg-slate-100'}`}>
              <ChevronLeft size={28} />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className={`w-[52px] h-[26px] rounded-full p-1 flex items-center relative overflow-hidden transition-all duration-300 cursor-pointer ${
              isDark 
                ? 'bg-gradient-to-r from-orange-400 via-orange-300 to-slate-800' 
                : 'bg-slate-100 border-slate-200 border shadow-inner'
            }`}
          >
             <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute transition-transform duration-300 ${isDark ? 'left-1' : 'left-[calc(100%-24px)]'}`}></div>
          </button>
          
          {/* Language Toggle Button */}
          <button 
            onClick={() => setLang(lang === 'mn' ? 'en' : 'mn')}
            className={`w-10 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-800 shadow-sm'}`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider">{lang === 'mn' ? 'EN' : 'MN'}</span>
          </button>
        </div>
      </div>

      <div className="px-8 pb-10 flex flex-col flex-1 overflow-y-auto hidden-scrollbar">
        
        {/* LOGIN STEP */}
        {step === 'login' && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h1 className={`text-3xl font-semibold mb-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.loginTitle}</h1>
            
            {/* Phone/Email tabs temporarily hidden */}
            {/* {renderTabs()} */}
            
            {method === 'phone' ? (
              <input type="tel" placeholder={t.phoneToken} value={phoneVal} onChange={e => setPhoneVal(e.target.value)} className={inputClass} />
            ) : (
              <input type="email" placeholder="example@gmail.com" value={emailVal} onChange={e => setEmailVal(e.target.value)} className={inputClass} />
            )}
            
            <input type="password" placeholder={t.passToken} value={passVal} onChange={e => { setPassVal(e.target.value); setLoginError(null); }} className={inputClass} />
            
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] px-4 py-3 rounded-xl mb-4 -mt-2 animate-in fade-in slide-in-from-top-2">
                 {loginError}
              </div>
            )}
            
            <div className={`flex justify-end mb-8 ${loginError ? '' : '-mt-2'}`}>
              <button onClick={() => setStep('forgot')} className={`text-[13px] font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                {t.forgotPass}
              </button>
            </div>
            
            <button onClick={handleLogin} disabled={loading} className="w-full bg-[#1877f2] hover:bg-blue-600 text-white py-4 rounded-full font-medium text-[16px] transition-transform active:scale-[0.98] disabled:opacity-50">
              {loading ? 'Loading...' : t.loginBtn}
            </button>
            
            <div className={`mt-auto text-center text-[13px] pt-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t.newUser} <button onClick={() => setStep('register_step1')} className={`font-medium ml-1 underline underline-offset-4 transition-colors ${isDark ? 'text-white decoration-white/30' : 'text-blue-600 decoration-blue-600/30'}`}>{t.registerLink}</button>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD STEP */}
        {step === 'forgot' && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className={`text-[22px] font-semibold mb-4 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.forgotTitle}</h2>
            <p className={`text-[13px] text-center mb-8 px-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.forgotDesc}</p>
            
            {/* Phone/Email tabs temporarily hidden */}
            {/* {renderTabs()} */}
            
            {method === 'phone' ? (
              <>
                <div className={`w-full bg-transparent border rounded-2xl px-5 py-4 text-[15px] outline-none mb-5 ${isDark ? 'border-white/10 text-white' : 'border-slate-300 text-slate-800'}`}>
                  {phoneVal || <span className="text-slate-500">{t.phoneToken}</span>}
                </div>
                <div className="flex-1 -mx-8"><Numpad onNumpadPress={onNumpadPress} isDark={isDark} /></div>
              </>
            ) : (
              <input type="email" placeholder="example@gmail.com" value={emailVal} onChange={e => setEmailVal(e.target.value)} className={inputClass} />
            )}
            
            <button onClick={() => setStep('verify')} className="w-full bg-[#1877f2] hover:bg-blue-600 text-white py-4 rounded-full font-medium text-[16px] transition-transform active:scale-[0.98] mt-auto">
              {t.continueBtn}
            </button>
          </div>
        )}

        {/* VERIFICATION STEP */}
        {step === 'verify' && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className={`text-[22px] font-semibold mb-4 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.verifyTitle}</h2>
            <p className={`text-[13px] text-center mb-10 leading-relaxed px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.verifyDesc}</p>
            
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`w-[60px] h-[64px] rounded-2xl border flex items-center justify-center text-2xl font-medium ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-800'}`}>
                   {verifyCode[i] || ''}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mb-6">
               <button className="text-[13px] text-slate-400 font-medium">{t.resendCode}</button>
            </div>
            
            <div className="flex-1 -mx-8"><Numpad onNumpadPress={onNumpadPress} isDark={isDark} /></div>
            
            <button onClick={() => setStep('reset')} className="w-full bg-[#1877f2] hover:bg-blue-600 text-white py-4 rounded-full font-medium text-[16px] transition-transform active:scale-[0.98] mt-6">
              {t.continueBtn}
            </button>
          </div>
        )}

        {/* RESET PASSWORD */}
        {step === 'reset' && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className={`text-[22px] font-semibold mb-10 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.resetTitle}</h2>
            <p className={`text-[14px] mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.passToken}</p>
            <input type="password" placeholder={t.newPass} className={inputClass} />
            <p className={`text-[14px] mb-3 mt-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Нууц үг давтан оруулах</p>
            <input type="password" placeholder={t.rePass} className={inputClass} />
            
            <button onClick={() => setStep('login')} className="w-full bg-[#1877f2] hover:bg-blue-600 text-white py-4 rounded-full font-medium text-[16px] transition-transform active:scale-[0.98] mt-auto">
              {t.continueBtn}
            </button>
          </div>
        )}

        {/* REGISTER STEP 1 */}
        {step === 'register_step1' && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className={`text-[22px] font-semibold mb-8 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.registerTitle}</h2>
            
            {/* Phone/Email tabs temporarily hidden */}
            {/* {renderTabs()} */}
            
            {method === 'phone' ? (
              <>
                <div className={`w-full bg-transparent border rounded-2xl px-5 py-4 text-[15px] outline-none mb-5 ${isDark ? 'border-white/10 text-white' : 'border-slate-300 text-slate-800'}`}>
                  {phoneVal || <span className="text-slate-500">{t.phoneToken}</span>}
                </div>
                <div className="flex-1 -mx-8"><Numpad onNumpadPress={onNumpadPress} isDark={isDark} /></div>
              </>
            ) : (
              <input type="email" placeholder="example@gmail.com" value={emailVal} onChange={e => setEmailVal(e.target.value)} className={inputClass} />
            )}
            
            <button onClick={() => setStep('register_step2')} className="w-full bg-[#1877f2] hover:bg-blue-600 text-white py-4 rounded-full font-medium text-[16px] transition-transform active:scale-[0.98] mt-auto">
              {t.continueBtn}
            </button>
          </div>
        )}

        {/* CONSENT / TERMS OF SERVICE STEP */}
        {step === 'consent' && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className={`text-[20px] font-semibold mb-6 px-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.consentTitle}</h2>
            <div className={`flex-1 overflow-y-auto p-5 rounded-2xl border text-[13px] leading-relaxed whitespace-pre-wrap ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              {t.consentText}
            </div>
            <button onClick={() => setStep('register_step2')} className="w-full bg-[#1877f2] hover:bg-blue-600 text-white py-4 rounded-full font-medium text-[16px] transition-transform active:scale-[0.98] mt-6">
              {t.agreeBtn}
            </button>
          </div>
        )}
        {/* REGISTER STEP 2 (Form) */}
        {step === 'register_step2' && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className={`text-[22px] font-semibold mb-6 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.registerTitle}</h2>
            
            <div className="space-y-4 mb-8 flex-1">
              
              <div>
                <p className={`text-[13px] mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.lastName}</p>
                <input type="text" placeholder={t.lastName} className={`${inputClass} mb-0 py-3.5`} />
              </div>
              
              <div>
                <p className={`text-[13px] mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.firstName}</p>
                <input type="text" placeholder={t.firstName} className={`${inputClass} mb-0 py-3.5`} />
              </div>
              
              <div>
                <p className={`text-[13px] mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.district}</p>
                <input type="text" placeholder={t.districtSelect} className={`${inputClass} mb-0 py-3.5`} />
              </div>
              
              <div>
                <p className={`text-[13px] mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.passToken}</p>
                <input type="password" value={passVal} onChange={e => setPassVal(e.target.value)} placeholder={t.newPass} className={`${inputClass} mb-1 py-3.5`} />
                {passVal.length > 0 && passVal.length < 6 && (
                  <p className="text-red-500 text-xs mb-3">Хамгийн багадаа 6 тэмдэгт байх ёстой.</p>
                )}
              </div>
              
              <div>
                <p className={`text-[13px] mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.rePass}</p>
                <input type="password" placeholder={t.rePass} className={`${inputClass} mb-0 py-3.5`} />
              </div>

              <div className="mt-6 flex flex-col gap-3">
                 <div onClick={() => setAgreed(!agreed)} className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-colors ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                    <div className={`mt-0.5 w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-colors ${agreed ? 'bg-blue-500 border-blue-500' : (isDark ? 'border-slate-500 bg-transparent' : 'border-slate-300 bg-white')}`}>
                      {agreed && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <p className={`text-[13px] leading-tight select-none ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {t.agreeTerms}
                    </p>
                 </div>
                 <button 
                   onClick={(e) => { e.stopPropagation(); setStep('consent'); }} 
                   className={`text-[13px] font-medium text-left px-4 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                 >
                   {t.consentTitle}
                 </button>
              </div>
            </div>

            <button onClick={handleRegister} disabled={loading || passVal.length < 6} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-full font-medium text-[16px] transition-transform active:scale-[0.98] mt-auto disabled:opacity-50">
              {loading ? 'Loading...' : t.continueBtn}
            </button>
          </div>
        )}



      </div>
      
      <style jsx global>{`
        .hidden-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hidden-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}


'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Language and Quiz Data
const lang: Record<string, any> = {
    ar: {
        title: "اختبار تحديد المستوى الملكي", mentor: "استمع جيداً لمرشدك وابدأ رحلتك", next_button: "السؤال التالي", start_journey: "ابدأ رحلتك الآن",
        tala7ot: "الرجاء اختيار إجابة أولاً.",
        levels: { t: "تلميذ النيل", k: "كاتب البردي", f: "الفرعون القوي" },
        result: {
            title_prefix: "مستواك الملكي:",
            t_message: "مستوى ممتاز للبداية! سنتعلم معكِ أساسيات الحياة اليومية وندعمكِ للوصول إلى مستوى 'كاتب البردي' بثقة.",
            k_message: "مستوى قوي جداً! لديكِ أساسيات جيدة، وسنركز على تطوير مهارات الحوار المعقد واستخدام تراكيب لغوية متقدمة.",
            f_message: "مستوى استثنائي! أنتِ على استعداد لخوض أصعب التحديات والمناقشات المعقدة. رحلة الإتقان النهائية تبدأ الآن."
        }
    },
    en: {
        title: "The Royal Level Assessment Test", mentor: "Listen carefully to your mentor and start your journey", next_button: "Next Question", start_journey: "Start Your Journey Now",
        tala7ot: "Please select an answer first.",
        levels: { t: "Disciple of the Nile", k: "Scribe of the Papyrus", f: "The Mighty Pharaoh" },
        result: {
            title_prefix: "Your Royal Level:",
            t_message: "Excellent starting level! We will teach you the daily basics and support you to reach the 'Scribe of the Papyrus' level confidently.",
            k_message: "Very strong level! You have solid basics, and we will focus on developing complex dialogue skills and advanced linguistic structures.",
            f_message: "Exceptional level! You are ready for the most complex challenges and discussions. Your final mastery journey begins now."
        }
    },
    fr: {
        title: "Test d'Évaluation de Niveau Royal", mentor: "Écoutez attentivement votre mentor et commencez votre voyage", next_button: "Question Suivante", start_journey: "Commencez votre voyage maintenant", tala7ot: "Veuillez d'abord sélectionner une réponse.",
        levels: { t: "Disciple du Nil", k: "Scribe du Papyrus", f: "Le Pharaon Puissant" },
        result: { title_prefix: "Votre Niveau Royal:", t_message: "Excellent niveau de départ! Nous vous enseignerons les bases quotidiennes et vous soutiendrons pour atteindre le niveau 'Scribe du Papyrus' avec confiance.",
            k_message: "Niveau très fort! Vous avez de bonnes bases, et nous nous concentrerons sur le développement de dialogues complexes et de structures linguistiques avancées.",
            f_message: "Niveau exceptionnel! Vous êtes prêt pour les défis et discussions les plus complexes. Votre voyage de maîtrise finale commence maintenant."
        }
    },
    es: { 
        title: "Test de Nivel Real", mentor: "Escuche a su mentor y comience su viaje.", next_button: "Siguiente Pregunta", start_journey: "Comience su viaje ahora.", tala7ot: "Seleccione una respuesta primero.",
        levels: { t: "Discípulo del Nilo", k: "Escriba del Papiro", f: "El Faraón Poderoso" },
        result: { title_prefix: "Su Nivel Real:", t_message: "Placeholder for Spanish (ES) result.", k_message: "Placeholder for Spanish (ES) result.", f_message: "Placeholder for Spanish (ES) result." }
    },
    zh: { 
        title: "皇家等级评估测试", mentor: "听从导师，开始旅程。", next_button: "下一题", start_journey: "立即开始您的旅程", tala7ot: "请先选择一个答案。",
        levels: { t: "尼罗河弟子", k: "纸莎草书记", f: "强大的法老" },
        result: { title_prefix: "您的皇家等级:", t_message: "Placeholder for Chinese (ZH) result.", k_message: "Placeholder for Chinese (ZH) result.", f_message: "Placeholder for Chinese (ZH) result." }
    },
    it: { 
        title: "Test Reale di Livello", mentor: "Ascolta il tuo mentore e inizia il tuo viaggio.", next_button: "Domanda Successiva", start_journey: "Inizia il tuo viaggio ora", tala7ot: "Si prega di selezionare prima una risposta.",
        levels: { t: "Discepolo del Nilo", k: "Scriba del Papiro", f: "Il Potente Faraone" },
        result: { title_prefix: "Il tuo Livello Reale:", t_message: "Placeholder for Italian (IT) result.", k_message: "Placeholder for Italian (IT) result.", f_message: "Placeholder for Italian (IT) result." }
    },
    nl: { 
        title: "Koninklijke Niveautest", mentor: "Luister naar je mentor en begin je reis.", next_button: "Volgende Vraag", start_journey: "Start nu je reis", tala7ot: "Selecteer eerst een antwoord.",
        levels: { t: "Leerling van de Nijl", k: "Papyrusschrijver", f: "De Machtige Farao" },
        result: { title_prefix: "Jouw Koninklijke Niveau:", t_message: "Placeholder for Dutch (NL) result.", k_message: "Placeholder for Dutch (NL) result.", f_message: "Placeholder for Dutch (NL) result." }
    },
    de: { 
        title: "Königlicher Level-Test", mentor: "Hören Sie auf Ihren Mentor und beginnen Sie Ihre Reise.", next_button: "Nächste Frage", start_journey: "Starten Sie jetzt Ihre Reise", tala7ot: "Bitte wählen Sie zuerst eine Antwort.",
        levels: { t: "Schüler des Nils", k: "Papyrus-Schreiber", f: "Der Mächtige Pharao" },
        result: { title_prefix: "Ihr Königliches Level:", t_message: "Placeholder for German (DE) result.", k_message: "Placeholder for German (DE) result.", f_message: "Placeholder for German (DE) result." }
    }
};

const quizData = [
    { level_key: 't', question: { ar: "ما هي الطريقة الصحيحة لقول 'أنا بخير، شكراً' باللهجة المصرية؟"}, options: [{ ar: "أنا منيح، شكراً." }, { ar: "أنا كويس/كويسة، متشكر/متشكرة." }, { ar: "أنا تمام التمام، يعطيك العافية." }], answer: 1 },
    { level_key: 't', question: { ar: "إذا أردت أن تسأل شخصاً عن سعر شيء، ماذا تقول؟"}, options: [{ ar: "كم تكلفة هذا الشيء؟" }, { ar: "بكام ده؟" }, { ar: "ما هو ثمنه من فضلك؟" }], answer: 1 },
    { level_key: 'k', question: { ar: "إذا كنت تريد التعبير عن شيء لم يكن متوقعاً ولكنه حدث (Surprise)، أي من التعبيرات التالية تستخدمه؟"}, options: [{ ar: "يا خبر أبيض!" }, { ar: "يلا بينا!" }, { ar: "تمام كده." }], answer: 0 },
    { level_key: 'k', question: { ar: "عندما يقول شخص ما 'فكرت كتييير في الموضوع ده'، ما معنى كلمة 'كتييير' في هذا السياق؟"}, options: [{ ar: "بسرعة" }, { ar: "بهدوء" }, { ar: "كثيراً" }], answer: 2 },
    { level_key: 'f', question: { ar: "للتعبير عن أنك متأكد من شيء ومصمم على تحقيقه (Determination)، أي جملة هي الأقوى؟"}, options: [{ ar: "أنا واثق إني هاعمل كده." }, { ar: "ده كلام نهائي ومفيش رجوع فيه." }, { ar: "يُحتمل أن يحدث." }], answer: 1 },
    { level_key: 'f', question: { ar: "أي من الجمل التالية تعبر عن رأيك في 'قضية معقدة' وتستخدم تركيباً لغوياً متقدماً؟"}, options: [{ ar: "القضية دي صعبة شوية." }, { ar: "في اعتقادي، تكمن المشكلة في البنية التحتية لهذه المسألة." }, { ar: "مش فاهم كويس إيه اللي بيحصل." }], answer: 1 }
];


export default function PlacementTestPage() {
    const [currentLang, setCurrentLang] = useState('ar');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>(Array(quizData.length).fill(null));
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const { toast } = useToast();

    const texts = lang[currentLang] || lang.ar;
    const isRtl = currentLang === 'ar';

    useEffect(() => {
        document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
        document.documentElement.lang = currentLang;
    }, [currentLang, isRtl]);

    const handleSelectOption = (index: number) => {
        setSelectedOption(index);
    };

    const handleNextQuestion = () => {
        if (selectedOption === null) {
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: texts.tala7ot,
            });
            return;
        }

        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = selectedOption;
        setUserAnswers(newAnswers);

        if (selectedOption === quizData[currentQuestionIndex].answer) {
            setFinalScore(s => s + 1);
        }

        setSelectedOption(null);

        if (currentQuestionIndex < quizData.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
        } else {
            setShowResult(true);
        }
    };
    
    const getResultDetails = () => {
        let finalLevelKey = 't';
        let iconClass = "fa-book-open";
        let messageKey = 't_message';

        if (finalScore >= 2 && finalScore <= 4) {
            finalLevelKey = 'k';
            iconClass = "fa-pen-fancy";
            messageKey = 'k_message';
        } else if (finalScore >= 5) {
            finalLevelKey = 'f';
            iconClass = "fa-crown";
            messageKey = 'f_message';
        }
        
        const finalLevelName = texts.levels[finalLevelKey];
        const resultTitle = `${texts.result.title_prefix} ${finalLevelName}`;
        const resultMessage = texts.result[messageKey];

        return { iconClass, resultTitle, resultMessage };
    };

    const progress = ((currentQuestionIndex) / quizData.length) * 100;
    const currentQuestion = quizData[currentQuestionIndex];
    const currentLevel = texts.levels[currentQuestion.level_key];

    const { iconClass, resultTitle, resultMessage } = getResultDetails();
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="fixed top-4 right-4 z-10 flex items-center gap-4">
                 <Select onValueChange={setCurrentLang} defaultValue={currentLang}>
                    <SelectTrigger className="w-[180px] bg-nile text-white border-none royal-title">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ar">العربية (AR)</SelectItem>
                        <SelectItem value="en">English (EN)</SelectItem>
                        <SelectItem value="fr">Français (FR)</SelectItem>
                        <SelectItem value="es">Español (ES)</SelectItem>
                        <SelectItem value="zh">中文 (ZH)</SelectItem>
                        <SelectItem value="it">Italiano (IT)</SelectItem>
                        <SelectItem value="nl">Nederlands (NL)</SelectItem>
                        <SelectItem value="de">Deutsch (DE)</SelectItem>
                    </SelectContent>
                </Select>
                 <Link href="/" className="utility-button px-4 py-2 text-md font-bold rounded-lg flex items-center justify-center">
                    <i className={`fas fa-arrow-left ${isRtl ? 'ml-2' : 'mr-2'}`}></i>
                    <span>العودة للوحة التحكم</span>
                </Link>
            </div>

            <div className="max-w-3xl mx-auto w-full p-6 bg-white rounded-2xl shadow-2xl border-t-8 border-gold-accent">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-dark-granite mb-2">
                        <span className="royal-title text-nile">{texts.title}</span>
                    </h1>
                    <p className="text-lg text-gray-600 flex items-center justify-center">
                        <span>{texts.mentor}</span>
                        <svg className="pharaoh-mentor-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                           <circle cx="50" cy="40" r="30" fill="#fadc99"/>
                            <path d="M 20 25 Q 50 10 80 25 L 80 40 Q 50 60 20 40 Z" fill="#316889"/>
                            <path d="M 20 25 Q 50 10 80 25 L 80 40 Q 50 60 20 40 Z" fill="none" stroke="#FFD700" strokeWidth="3"/>
                            <line x1="25" y1="30" x2="75" y2="30" stroke="#FFD700" strokeWidth="3"/>
                            <line x1="25" y1="40" x2="75" y2="40" stroke="#FFD700" strokeWidth="3"/>
                            <path d="M 40 70 C 40 85, 60 85, 60 70 L 55 60 L 45 60 Z" fill="#316889" stroke="#FFD700" strokeWidth="2"/>
                            <circle cx="40" cy="40" r="4" fill="#316889"/>
                            <circle cx="60" cy="40" r="4" fill="#316889"/>
                            <path d="M 45 55 Q 50 58 55 55" stroke="#316889" strokeWidth="2" fill="none"/>
                        </svg>
                    </p>
                </div>

                {!showResult ? (
                    <>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                            <div className="bg-nile h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>

                        <div className="question-container">
                            <h2 className="text-2xl font-bold mb-6 text-dark-granite text-right">
                                {`(${currentLevel}) - ${currentQuestion.question.ar}`}
                            </h2>
                            
                            <div className="space-y-4">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        className={cn(
                                            'w-full text-right p-4 rounded-lg border-2 transition-all duration-200 text-lg',
                                            selectedOption === index 
                                                ? 'bg-nile text-white border-gold-accent shadow-lg' 
                                                : 'bg-white text-dark-granite border-gray-300 hover:bg-gray-100 hover:border-nile'
                                        )}
                                        onClick={() => handleSelectOption(index)}
                                    >
                                        {option.ar}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex justify-end mt-8">
                                <Button
                                    id="next-question-button"
                                    className="cta-button px-8 py-3 text-lg rounded-full"
                                    onClick={handleNextQuestion}
                                >
                                    {texts.next_button}
                                    <i className={`fas ${isRtl ? 'fa-chevron-left mr-2' : 'fa-chevron-right ml-2'}`}></i>
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-4">
                        <i className={`fas ${iconClass} text-6xl mb-4 text-gold-accent`}></i>
                        <h3 className="text-3xl font-bold mb-4 text-dark-granite royal-title">{resultTitle}</h3>
                        <p className="text-lg mb-6 text-gray-700">{resultMessage}</p>
                        <Link href="/">
                            <Button className="cta-button px-6 py-2 rounded-full">
                                {texts.start_journey}
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

    
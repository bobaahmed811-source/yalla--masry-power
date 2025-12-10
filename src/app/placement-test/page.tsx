
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
import { useRouter } from 'next/navigation';

// Language and Quiz Data
const lang: Record<string, any> = {
    ar: {
        title: "اختبار تحديد المستوى الملكي", mentor: "استمع جيداً لمرشدك وابدأ رحلتك", next_button: "السؤال التالي", start_journey: "ابدأ رحلتك الآن",
        tala7ot: "الرجاء اختيار إجابة أولاً.",
        go_back: "العودة للوحة التحكم",
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
        go_back: "Back to Dashboard",
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
        go_back: "Retour au tableau de bord",
        levels: { t: "Disciple du Nil", k: "Scribe du Papyrus", f: "Le Pharaon Puissant" },
        result: { title_prefix: "Votre Niveau Royal:", t_message: "Excellent niveau de départ! Nous vous enseignerons les bases quotidiennes et vous soutiendrons pour atteindre le niveau 'Scribe du Papyrus' avec confiance.",
            k_message: "Niveau très fort! Vous avez de bonnes bases, et nous nous concentrerons sur le développement de dialogues complexes et de structures linguistiques avancées.",
            f_message: "Niveau exceptionnel! Vous êtes prêt pour les défis et discussions les plus complexes. Votre voyage de maîtrise finale commence maintenant."
        }
    },
    es: { 
        title: "Test de Nivel Real", mentor: "Escuche a su mentor y comience su viaje.", next_button: "Siguiente Pregunta", start_journey: "Comience su viaje ahora.", tala7ot: "Seleccione una respuesta primero.",
        go_back: "Volver al Panel",
        levels: { t: "Discípulo del Nilo", k: "Escriba del Papiro", f: "El Faraón Poderoso" },
        result: { title_prefix: "Su Nivel Real:", t_message: "¡Excelente nivel de partida! Te enseñaremos lo básico del día a día y te apoyaremos para que alcances el nivel 'Escriba del Papiro' con confianza.", k_message: "¡Nivel muy fuerte! Tienes una base sólida, y nos centraremos en desarrollar habilidades de diálogo complejas y estructuras lingüísticas avanzadas.", f_message: "¡Nivel excepcional! Estás listo para los desafíos y discusiones más complejos. Tu viaje final hacia la maestría comienza ahora." }
    },
    zh: { 
        title: "皇家等级评估测试", mentor: "听从导师，开始旅程。", next_button: "下一题", start_journey: "立即开始您的旅程", tala7ot: "请先选择一个答案。",
        go_back: "返回仪表板",
        levels: { t: "尼罗河弟子", k: "纸莎草书记", f: "强大的法老" },
        result: { title_prefix: "您的皇家等级:", t_message: "优秀的起点！我们将教您日常基础知识，并支持您自信地达到“纸莎草书记”级别。", k_message: "非常强大的水平！您有扎实的基础，我们将专注于发展复杂的对话技巧和高级语言结构。", f_message: "卓越的水平！您已准备好迎接最复杂的挑战和讨论。您的终极掌握之旅现在开始。" }
    },
    it: { 
        title: "Test Reale di Livello", mentor: "Ascolta il tuo mentore e inizia il tuo viaggio.", next_button: "Domanda Successiva", start_journey: "Inizia il tuo viaggio ora", tala7ot: "Si prega di selezionare prima una risposta.",
        go_back: "Torna alla Dashboard",
        levels: { t: "Discepolo del Nilo", k: "Scriba del Papiro", f: "Il Potente Faraone" },
        result: { title_prefix: "Il tuo Livello Reale:", t_message: "Eccellente livello di partenza! Ti insegneremo le basi quotidiane e ti supporteremo per raggiungere con sicurezza il livello 'Scriba del Papiro'.", k_message: "Livello molto forte! Hai solide basi e ci concentreremo sullo sviluppo di complesse abilità di dialogo e strutture linguistiche avanzate.", f_message: "Livello eccezionale! Sei pronto per le sfide e le discussioni più complesse. Il tuo viaggio di padronanza finale inizia ora." }
    },
    nl: { 
        title: "Koninklijke Niveautest", mentor: "Luister naar je mentor en begin je reis.", next_button: "Volgende Vraag", start_journey: "Start nu je reis", tala7ot: "Selecteer eerst een antwoord.",
        go_back: "Terug naar Dashboard",
        levels: { t: "Leerling van de Nijl", k: "Papyrusschrijver", f: "De Machtige Farao" },
        result: { title_prefix: "Jouw Koninklijke Niveau:", t_message: "Uitstekend startniveau! We leren je de dagelijkse basis en ondersteunen je om vol vertrouwen het niveau 'Papyrusschrijver' te bereiken.", k_message: "Zeer sterk niveau! Je hebt een solide basis, en we zullen ons richten op het ontwikkelen van complexe dialoogvaardigheden en geavanceerde linguïstische structuren.", f_message: "Uitzonderlijk niveau! Je bent klaar voor de meest complexe uitdagingen en discussies. Je laatste meesterschapsreis begint nu." }
    },
    de: { 
        title: "Königlicher Einstufungstest", mentor: "Hören Sie auf Ihren Mentor und beginnen Sie Ihre Reise.", next_button: "Nächste Frage", start_journey: "Beginnen Sie jetzt Ihre Reise", tala7ot: "Bitte wählen Sie zuerst eine Antwort.",
        go_back: "Zurück zum Dashboard",
        levels: { t: "Schüler des Nils", k: "Schreiber des Papyrus", f: "Der mächtige Pharao" },
        result: { title_prefix: "Ihr Königliches Level:", t_message: "Ausgezeichnetes Einstiegslevel! Wir bringen Ihnen die täglichen Grundlagen bei und unterstützen Sie dabei, das Level 'Schreiber des Papyrus' selbstbewusst zu erreichen.", k_message: "Sehr starkes Level! Sie haben solide Grundlagen, und wir werden uns auf die Entwicklung komplexer Dialogfähigkeiten und fortgeschrittener sprachlicher Strukturen konzentrieren.", f_message: "Außergewöhnliches Level! Sie sind bereit für die komplexesten Herausforderungen und Diskussionen. Ihre endgültige Reise zur Meisterschaft beginnt jetzt." }
    }
};

const quizData = [
    { level_key: 't', question: { ar: "عندما تقابل صديقًا في الشارع، ماذا تقول له؟" }, options: [{ ar: "السلام عليكم، كيف الحال؟" }, { ar: "إزيك! عامل إيه؟" }, { ar: "مرحباً يا صديقي العزيز." }], answer: 1 },
    { level_key: 't', question: { ar: "في السوق، كيف تسأل عن سعر كيلو الطماطم؟" }, options: [{ ar: "بكام كيلو الطماطم لو سمحت؟" }, { ar: "أرغب في معرفة ثمن كيلوجرام من الطماطم." }, { ar: "الطماطم دي للبيع؟" }], answer: 0 },
    { level_key: 'k', question: { ar: "صديقك وصل متأخراً جداً، وأنت تقول له مازحاً: 'يااه! ده انت جاي بدري أوي!'. هذا الأسلوب يسمى:" }, options: [{ ar: "تهكم (Sarcasm)" }, { ar: "مدح (Praise)" }, { ar: "سؤال (Question)" }], answer: 0 },
    { level_key: 'k', question: { ar: "ما هو المعنى الأكثر شيوعاً لكلمة 'معلش' في الشارع المصري؟" }, options: [{ ar: "لا أفهم." }, { ar: "اعتذار أو مواساة (Sorry / It's okay)" }, { ar: "أنا موافق." }], answer: 1 },
    { level_key: 'f', question: { ar: "للتعبير عن أنك 'فاض بيك الكيل' (Fed up)، أي جملة هي الأنسب؟" }, options: [{ ar: "أنا تعبت شوية." }, { ar: "خلاص، أنا جبت آخري!" }, { ar: "الموضوع ده محتاج تفكير." }], answer: 1 },
    { level_key: 'f', question: { ar: "في نقاش عمل، تريد أن تقول 'Let's get straight to the point'. ما هي الترجمة العامية الأفضل؟" }, options: [{ ar: "دعنا نذهب مباشرة إلى النقطة." }, { ar: "نخش في الموضوع على طول؟" }, { ar: "ما هو الموضوع الأساسي؟" }], answer: 1 }
];


export default function PlacementTestPage() {
    const [currentLang, setCurrentLang] = useState('ar');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>(Array(quizData.length).fill(null));
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const { toast } = useToast();
    const router = useRouter();

    const texts = lang[currentLang] || lang.ar;
    const isRtl = currentLang === 'ar';

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
            document.documentElement.lang = currentLang;
        }
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

    const handleStartJourney = () => {
        // In a real app, you'd save the level to Firestore.
        router.push('/');
    };

    const progress = ((currentQuestionIndex) / quizData.length) * 100;
    const currentQuestion = quizData[currentQuestionIndex];
    const currentLevel = texts.levels[currentQuestion.level_key];

    const { iconClass, resultTitle, resultMessage } = getResultDetails();
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-nile-dark p-4">
            <div className="fixed top-4 left-4 z-10 flex items-center gap-4">
                 <Select onValueChange={setCurrentLang} defaultValue={currentLang}>
                    <SelectTrigger className="w-[180px] bg-gold-accent text-dark-granite border-none royal-title font-bold shadow-lg">
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
                    <span id="go_back-text">{texts.go_back}</span>
                </Link>
            </div>

            <div className="max-w-3xl mx-auto w-full p-6 bg-white rounded-2xl shadow-2xl dashboard-card text-white">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-dark-granite mb-2">
                        <span id="title-text" className="royal-title text-gold-accent">{texts.title}</span>
                    </h1>
                    <p id="mentor-text" className="text-lg text-sand-ochre flex items-center justify-center">
                        <span>{texts.mentor}</span>
                        <svg className="pharaoh-mentor-icon w-12 h-12 inline-block mx-2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                           <circle cx="50" cy="40" r="30" fill="#fadc99"/>
                            <path d="M 20 25 Q 50 10 80 25 L 80 40 Q 50 60 20 40 Z" fill="#0b4e8d"/>
                            <path d="M 20 25 Q 50 10 80 25 L 80 40 Q 50 60 20 40 Z" fill="none" stroke="#FFD700" strokeWidth="3"/>
                            <line x1="25" y1="30" x2="75" y2="30" stroke="#FFD700" strokeWidth="3"/>
                            <line x1="25" y1="40" x2="75" y2="40" stroke="#FFD700" strokeWidth="3"/>
                            <path d="M 40 70 C 40 85, 60 85, 60 70 L 55 60 L 45 60 Z" fill="#0b4e8d" stroke="#FFD700" strokeWidth="2"/>
                            <circle cx="40" cy="40" r="4" fill="#0b4e8d"/>
                            <circle cx="60" cy="40" r="4" fill="#0b4e8d"/>
                            <path d="M 45 55 Q 50 58 55 55" stroke="#0b4e8d" strokeWidth="2" fill="none"/>
                        </svg>
                    </p>
                </div>

                {!showResult ? (
                    <>
                        <div className="progress-bar-royal mb-8">
                            <div className="progress-fill-royal" style={{ width: `${progress}%` }}></div>
                        </div>

                        <div className="question-container">
                            <h2 className="text-2xl font-bold mb-6 text-white text-right">
                                {`(${currentLevel}) - ${currentQuestion.question.ar}`}
                            </h2>
                            
                            <div className="space-y-4">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        className={cn(
                                            'w-full text-right p-4 rounded-lg border-2 transition-all duration-200 text-lg',
                                            selectedOption === index 
                                                ? 'bg-gold-accent text-nile-dark border-gold-accent shadow-lg scale-105' 
                                                : 'bg-nile text-sand-ochre border-sand-ochre hover:bg-sand-ochre/20'
                                        )}
                                        onClick={() => handleSelectOption(index)}
                                    >
                                        {option.ar}
                                    </button>
                                ))}
                            </div>
                            
                            <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} mt-8`}>
                                <Button
                                    id="next-question-button"
                                    className="cta-button px-8 py-3 text-lg rounded-full"
                                    onClick={handleNextQuestion}
                                >
                                    <span id="next_button-text">{texts.next_button}</span>
                                    <i className={`fas ${isRtl ? 'fa-chevron-left mr-2' : 'fa-chevron-right ml-2'}`}></i>
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-4">
                        <i className={`fas ${iconClass} text-6xl mb-4 text-gold-accent`}></i>
                        <h3 id="result-title-text" className="text-3xl font-bold mb-4 text-white royal-title">{resultTitle}</h3>
                        <p id="result-message-text" className="text-lg mb-6 text-sand-ochre">{resultMessage}</p>
                        <Button 
                            id="start_journey-button" 
                            className="cta-button px-6 py-2 rounded-full"
                            onClick={handleStartJourney}
                        >
                            {texts.start_journey}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

    
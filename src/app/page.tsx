
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

export default function RoyalDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [pharaonicAlias, setPharaonicAlias] = useState("زائر فرعوني");
  const [aliasInput, setAliasInput] = useState("زائر فرعوني");
  const { toast } = useToast();


  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  useEffect(() => {
    async function fetchUserAlias() {
      if (userDocRef) {
        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists() && docSnap.data().alias) {
              const userData = docSnap.data();
              setPharaonicAlias(userData.alias);
              setAliasInput(userData.alias);
            } else if (user && !docSnap.exists()) {
              // If no alias and no doc, set initial one in db non-blockingly
              const initialAlias = "تحتمس القوي";
              setPharaonicAlias(initialAlias);
              setAliasInput(initialAlias);
              const initialData = { alias: initialAlias, id: user.uid, email: user.email, name: user.displayName || 'Anonymous', registrationDate: new Date().toISOString() };
              setDocumentNonBlocking(userDocRef, initialData, { merge: true });
            }
        } catch (error) {
            console.error("Error fetching user alias:", error);
        }
      } else {
        // Not logged in
        setPharaonicAlias("زائر فرعوني");
        setAliasInput("");
      }
    }
    fetchUserAlias();
  }, [userDocRef, user]);
  
  useEffect(() => {
    let currentLang = 'ar';
    
    const lang: Record<string, Record<string, string>> = {
      ar: {
          title: "لوحة التحكم الملكية", alias_label: "اسمك الفرعوني المستعار:", alias_placeholder: "اكتب اسمك الفرعوني هنا...", alias_button: "تحديث الاسم",
          library_button: "مكتبة الدروس المُتقنة", review_button: "كلمات تحتاج إلى مراجعة", level_label: "المستوى الحالي:", level_name: "تلميذ النيل", metrics_title: "إحصائيات التقدم والموارد",
          words_mastered_label: "كلمات مُتقنة", nile_points_label: "نقاط النيل", streak_days_label: "أيام متواصلة", total_time_label: "إجمالي الوقت (س)",
          challenges_title: "تحدياتك القادمة", current_challenge_title: "القصة المصورة: في السوق", current_challenge_desc: "تدريب على حوارات الشراء والبيع.",
          start_button_text: "ابدأ التحدي التالي", progress_title: "تقدم المستوى", level_progress_text: "متبقي لكاتب البردي",
          leaderboard_title: "لوحة صدارة الأهرامات",
          completed_label: "مُكتمل", locked_label: "مُغلق",
          user_id_label: "معرّف المستخدم:",
          leaderboard_1: "الملكة حتشبسوت", leaderboard_2: "امنحتب الحكيم", leaderboard_4: "نفرتيتي الرشيقة",
          comic_studio_button: "استوديو القصص المصورة",
          museum_button: "المتحف الافتراضي",
          store_button: "متجر البرديات",
          tutor_button: "المعلم الخصوصي",
          word_scramble_button: "تحدي الكلمات",
          dialogue_challenge_button: "تحدي الحوار",
          placement_test_button: "ابدأ تحديد المستوى",
          booking_button: "حجز الدروس الملكية",
          quran_button: "واحة القرآن والسنة",
          pronunciation_challenge_button: "تحدي النطق",
          logout_button: "تسجيل الخروج",
          login_button: "تسجيل الدخول"
      },
      en: {
          title: "Royal Control Panel", alias_label: "Your Pharaonic Alias:", alias_placeholder: "Enter your Pharaonic name here...", alias_button: "Update Alias",
          library_button: "Mastered Lessons Library", review_button: "Words Needing Review", level_label: "Current Level:", level_name: "Disciple of the Nile", metrics_title: "Progress & Resources Statistics",
          words_mastered_label: "Words Mastered", nile_points_label: "Nile Points", streak_days_label: "Consecutive Days", total_time_label: "Total Time (h)",
          challenges_title: "Your Upcoming Challenges", current_challenge_title: "Illustrated Story: In the Market", current_challenge_desc: "Dialogue practice for buying and selling.",
          start_button_text: "Start Next Challenge", progress_title: "Level Progress", level_progress_text: "Remaining for Scribe of the Papyrus",
          leaderboard_title: "Pharaohs' Leaderboard",
          completed_label: "Completed", locked_label: "Locked",
          user_id_label: "User ID:",
          leaderboard_1: "Queen Hatshepsut", leaderboard_2: "Amenhotep the Wise", leaderboard_4: "Nefertiti the Graceful",
          comic_studio_button: "Comic Studio",
          museum_button: "Virtual Museum",
          store_button: "Papyri Store",
          tutor_button: "AI Tutor",
          word_scramble_button: "Word Scramble",
          dialogue_challenge_button: "Dialogue Challenge",
          placement_test_button: "Start Placement Test",
          booking_button: "Royal Lesson Booking",
          quran_button: "Quran & Sunnah Oasis",
          pronunciation_challenge_button: "Pronunciation Challenge",
          logout_button: "Log Out",
          login_button: "Log In",
      },
      zh: {
          title: "皇家控制面板", alias_label: "你的法老别名:", alias_placeholder: "在此输入你的法老名字...", alias_button: "更新别名",
          library_button: "已掌握课程库", review_button: "需要复习的单词", level_label: "当前级别:", level_name: "尼罗河的门徒", metrics_title: "进度与资源统计",
          words_mastered_label: "已掌握单词", nile_points_label: "尼罗河积分", streak_days_label: "连续天数", total_time_label: "总时间 (小时)",
          challenges_title: "你接下来的挑战", current_challenge_title: "图画故事：在市场", current_challenge_desc: "买卖对话练习。",
          start_button_text: "开始下一个挑战", progress_title: "级别进度", level_progress_text: "距离纸莎草抄写员还剩",
          leaderboard_title: "法老排行榜",
          completed_label: "已完成", locked_label: "已锁定",
          user_id_label: "用户ID:",
          leaderboard_1: "哈特谢普苏特女王", leaderboard_2: "智慧的阿蒙霍特普", leaderboard_4: "优雅的娜芙蒂蒂",
          comic_studio_button: "漫画工作室",
          museum_button: "虚拟博物馆",
          store_button: "纸莎草商店",
          tutor_button: "人工智能导师",
          word_scramble_button: "单词拼凑挑战",
          dialogue_challenge_button: "对话挑战",
          placement_test_button: "开始水平测试",
          booking_button: "皇家课程预订",
          quran_button: "古兰经与圣训绿洲",
          pronunciation_challenge_button: "发音挑战",
          logout_button: "登出",
          login_button: "登录"
      },
      fr: {
        title: "Panneau de Contrôle Royal", alias_label: "Votre Alias Pharaonique:", alias_placeholder: "Entrez votre nom pharaonique...", alias_button: "Mettre à jour",
        library_button: "Bibliothèque de Leçons", review_button: "Mots à réviser", level_label: "Niveau Actuel:", level_name: "Disciple du Nil", metrics_title: "Statistiques de Progrès",
        words_mastered_label: "Mots Maîtrisés", nile_points_label: "Points du Nil", streak_days_label: "Jours Consécutifs", total_time_label: "Temps Total (h)",
        challenges_title: "Vos Prochains Défis", current_challenge_title: "Histoire Illustrée: Au Marché", current_challenge_desc: "Pratique du dialogue d'achat.",
        start_button_text: "Commencer le Défi", progress_title: "Progression de Niveau", level_progress_text: "Restant pour Scribe",
        leaderboard_title: "Classement des Pharaons",
        completed_label: "Terminé", locked_label: "Verrouillé",
        user_id_label: "ID Utilisateur:",
        leaderboard_1: "Reine Hatchepsout", leaderboard_2: "Amenhotep le Sage", leaderboard_4: "Néfertiti la Gracieuse",
        comic_studio_button: "Studio de BD",
        museum_button: "Musée Virtuel",
        store_button: "Magasin de Papyri",
        tutor_button: "Tuteur IA",
        word_scramble_button: "Défi de Mots",
        dialogue_challenge_button: "Défi de Dialogue",
        placement_test_button: "Commencer le Test",
        booking_button: "Réservation de Leçon",
        quran_button: "Oasis du Coran",
        pronunciation_challenge_button: "Défi de Prononciation",
        logout_button: "Déconnexion",
        login_button: "Connexion",
      },
      es: { 
        title: "Panel de Control Real", alias_label: "Tu Alias Faraónico:", alias_placeholder: "Introduce tu nombre...", alias_button: "Actualizar",
        level_name: "Discípulo del Nilo", metrics_title: "Estadísticas de Progreso",
        words_mastered_label: "Palabras Dominadas", nile_points_label: "Puntos del Nilo", streak_days_label: "Días Consecutivos", total_time_label: "Tiempo Total (h)",
        challenges_title: "Tus Próximos Desafíos", current_challenge_title: "Historia Ilustrada: En el Mercado",
        start_button_text: "Siguiente Desafío", progress_title: "Progreso de Nivel", level_progress_text: "Restante para Escriba",
        leaderboard_title: "Clasificación de Faraones",
        logout_button: "Cerrar Sesión", login_button: "Iniciar Sesión"
      },
      it: { 
        title: "Pannello di Controllo Reale", alias_label: "Il Tuo Alias Faraonico:", alias_placeholder: "Inserisci il tuo nome...", alias_button: "Aggiorna",
        level_name: "Discepolo del Nilo", metrics_title: "Statistiche di Progresso",
        words_mastered_label: "Parole Padroneggiate", nile_points_label: "Punti del Nilo", streak_days_label: "Giorni Consecutivi", total_time_label: "Tempo Totale (ore)",
        challenges_title: "Le Tue Prossime Sfide", current_challenge_title: "Storia Illustrata: Al Mercato",
        start_button_text: "Prossima Sfida", progress_title: "Avanzamento di Livello", level_progress_text: "Rimanente per Scriba",
        leaderboard_title: "Classifica dei Faraoni",
        logout_button: "Esci", login_button: "Accedi"
      },
      nl: { 
        title: "Koninklijk Bedieningspaneel", alias_label: "Jouw Faraonische Alias:", alias_placeholder: "Voer je naam in...", alias_button: "Update",
        level_name: "Discipel van de Nijl", metrics_title: "Voortgangsstatistieken",
        words_mastered_label: "Beheerste Woorden", nile_points_label: "Nijlpunten", streak_days_label: "Opeenvolgende Dagen", total_time_label: "Totale Tijd (u)",
        challenges_title: "Je Komende Uitdagingen", current_challenge_title: "Geïllustreerd Verhaal: Op de Markt",
        start_button_text: "Volgende Uitdaging", progress_title: "Niveauvoortgang", level_progress_text: "Resterend voor Schrijver",
        leaderboard_title: "Klassement van de Farao's",
        logout_button: "Uitloggen", login_button: "Inloggen"
      },
      de: { 
        title: "Königliches Kontrollfeld", alias_label: "Dein Pharaonischer Alias:", alias_placeholder: "Gib deinen Namen ein...", alias_button: "Aktualisieren",
        level_name: "Schüler des Nils", metrics_title: "Fortschrittsstatistiken",
        words_mastered_label: "Beherrschte Wörter", nile_points_label: "Nil-Punkte", streak_days_label: "Aufeinanderfolgende Tage", total_time_label: "Gesamtzeit (Std.)",
        challenges_title: "Deine Nächsten Herausforderungen", current_challenge_title: "Illustrierte Geschichte: Auf dem Markt",
        start_button_text: "Nächste Herausforderung", progress_title: "Level-Fortschritt", level_progress_text: "Verbleibend für Schreiber",
        leaderboard_title: "Rangliste der Pharaonen",
        logout_button: "Ausloggen", login_button: "Einloggen"
      }
    };
  
    function setLanguage(langCode: string) {
        if(!lang[langCode]) langCode = 'ar'; // Fallback to arabic
        currentLang = langCode;
        const texts = lang[currentLang];
        const isRtl = currentLang === 'ar';
    
        document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
        document.documentElement.lang = currentLang;
    
        const querySelector = (selector: string) => document.querySelector(selector) as HTMLElement;

        if(querySelector('#main-title')) querySelector('#main-title').textContent = texts.title;
        if(querySelector('#alias-label')) querySelector('#alias-label').textContent = texts.alias_label;
        const aliasInputEl = querySelector('#alias-input') as HTMLInputElement;
        if(aliasInputEl) aliasInputEl.placeholder = texts.alias_placeholder;
        if(querySelector('#update-alias-button')) querySelector('#update-alias-button').textContent = texts.alias_button;
        if(querySelector('#current-user-rank')) querySelector('#current-user-rank').textContent = pharaonicAlias;
        
        if(querySelector('#library-button-text')) querySelector('#library-button-text').textContent = texts.library_button;
        if(querySelector('#review-button-text')) querySelector('#review-button-text').textContent = texts.review_button;

        if(querySelector('#placement-test-button-text')) querySelector('#placement-test-button-text').textContent = texts.placement_test_button;
        if(querySelector('#comic-studio-button-text')) querySelector('#comic-studio-button-text').textContent = texts.comic_studio_button;
        if(querySelector('#museum-button-text')) querySelector('#museum-button-text').textContent = texts.museum_button;
        if(querySelector('#store-button-text')) querySelector('#store-button-text').textContent = texts.store_button;
        if(querySelector('#tutor-button-text')) querySelector('#tutor-button-text').textContent = texts.tutor_button;
        if(querySelector('#word-scramble-button-text')) querySelector('#word-scramble-button-text').textContent = texts.word_scramble_button;
        if(querySelector('#dialogue-challenge-button-text')) querySelector('#dialogue-challenge-button-text').textContent = texts.dialogue_challenge_button;
        if(querySelector('#booking-button-text')) querySelector('#booking-button-text').textContent = texts.booking_button;
        if(querySelector('#quran-button-text')) querySelector('#quran-button-text').textContent = texts.quran_button;
        if(querySelector('#pronunciation-challenge-button-text')) querySelector('#pronunciation-challenge-button-text').textContent = texts.pronunciation_challenge_button;

        if (user) {
          if (querySelector('#auth-link-text')) querySelector('#auth-link-text').textContent = texts.logout_button;
        } else {
          if (querySelector('#auth-link-text')) querySelector('#auth-link-text').textContent = texts.login_button;
        }
    
        const levelDisplay = querySelector('#level-display');
        if (levelDisplay) levelDisplay.innerHTML = `${texts.level_label} <span class="text-sand-ochre">${texts.level_name}</span>`;

        const userIdDisplay = querySelector('#user-id-display');
        if (userIdDisplay) {
            if (user) {
                userIdDisplay.innerHTML = `<i class="fas fa-user-circle ${isRtl ? 'ml-1' : 'mr-1'}"></i> ${texts.user_id_label} <span>${user.uid}</span>`;
                userIdDisplay.classList.remove('hidden');
            } else {
                userIdDisplay.classList.add('hidden');
            }
        }
    }
    
    setLanguage('ar');

    const langSelect = document.getElementById('language-select') as HTMLSelectElement;
    const handleLangChange = (e: Event) => {
      setLanguage((e.target as HTMLSelectElement).value);
    }
    langSelect?.addEventListener('change', handleLangChange);

    return () => {
        langSelect?.removeEventListener('change', handleLangChange);
    };

  }, [pharaonicAlias, user, isUserLoading]);

  const updateAliasInFirestore = () => {
    if (!userDocRef) {
      toast({ variant: 'destructive', title: "خطأ", description: "يجب تسجيل الدخول لتحديث الاسم." });
      return;
    }
    const newAlias = aliasInput.trim();
    if (newAlias) {
      setDocumentNonBlocking(userDocRef, { alias: newAlias }, { merge: true });
      setPharaonicAlias(newAlias);
      toast({ title: "تم", description: `تم تحديث الاسم بنجاح إلى: ${newAlias}`});
    } else {
      toast({  variant: 'destructive', title: "خطأ", description: 'الرجاء إدخال اسم فرعوني صحيح.'});
    }
  };
  
  return (
    <div className="antialiased min-h-screen bg-nile-dark p-6 md:p-12">
        <div className="fixed top-4 left-4 z-50 flex space-x-2">
            <select id="language-select" className="bg-gold-accent text-dark-granite p-2 rounded-lg font-bold cursor-pointer shadow-lg">
                <option value="ar">العربية (AR)</option>
                <option value="en">English (EN)</option>
                <option value="fr">Français (FR)</option>
                <option value="es">Español (ES)</option>
                <option value="zh">中文 (ZH)</option>
                <option value="it">Italiano (IT)</option>
                <option value="nl">Nederlands (NL)</option>
                <option value="de">Deutsch (DE)</option>
            </select>
            <Link href={user ? '/api/auth/logout' : '/login'} id="auth-link" className="utility-button px-4 py-2 text-md font-bold rounded-lg flex items-center justify-center">
                <i className={`fas ${user ? 'fa-sign-out-alt' : 'fa-sign-in-alt'} text-lg ml-2`}></i> 
                <span id="auth-link-text">{user ? 'تسجيل الخروج' : 'تسجيل الدخول'}</span>
            </Link>
        </div>


        <div className="max-w-7xl mx-auto w-full">
            <header className="text-center mb-6 pb-4 border-b-4 border-gold-accent">
                <h1 id="main-title" className="text-5xl md:text-6xl royal-title mb-2">لوحة التحكم الملكية</h1>
                <p id="level-display" className="text-xl text-gray-300 font-bold">
                    المستوى الحالي: <span className="text-sand-ochre">تلميذ النيل</span>
                </p>
                <p id="user-id-display" className="text-sm text-gray-500 mt-2 hidden">
                    <i className="fas fa-user-circle ml-1"></i> <span></span>
                </p>
            </header>

            <div className="alias-management-card p-4 rounded-lg mb-8 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4">
                <label htmlFor="alias-input" id="alias-label" className="text-lg font-bold text-sand-ochre whitespace-nowrap">اسمك الفرعوني المستعار:</label>
                <input 
                  type="text" 
                  id="alias-input" 
                  className="w-full md:w-auto flex-grow focus:ring-2 focus:ring-gold-accent focus:outline-none" 
                  placeholder="اكتب اسمك الفرعوني هنا..." 
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  disabled={!user || isUserLoading}
                />
                <button 
                  id="update-alias-button" 
                  className="cta-button px-6 py-2 rounded-full w-full md:w-auto"
                  onClick={updateAliasInFirestore}
                  disabled={!user || isUserLoading}
                >
                    تحديث الاسم
                </button>
            </div>
            
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                <Link href="/quran" id="quran-button" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-green-400 text-green-400">
                    <i className="fas fa-quran text-xl ml-3"></i>
                    <span id="quran-button-text">واحة القرآن والسنة</span>
                </Link>
                <Link href="/placement-test" id="placement-test-button" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-blue-400 text-blue-400">
                    <i className="fas fa-tasks text-xl ml-3"></i>
                    <span id="placement-test-button-text">ابدأ تحديد المستوى</span>
                </Link>
                <Link href="/booking" id="booking-button" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-teal-400 text-teal-400">
                    <i className="fas fa-calendar-check text-xl ml-3"></i>
                    <span id="booking-button-text">حجز الدروس الملكية</span>
                </Link>
                <Link href="/comic-studio" id="comic-studio-button" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-amber-400 text-amber-400">
                    <i className="fas fa-paint-brush text-xl ml-3"></i>
                    <span id="comic-studio-button-text">استوديو القصص المصورة</span>
                </Link>
                 <Link href="/museum" id="museum-button" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-cyan-400 text-cyan-400">
                    <i className="fas fa-landmark text-xl ml-3"></i>
                    <span id="museum-button-text">المتحف الافتراضي</span>
                </Link>
                <Link href="/store" id="store-button" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-emerald-400 text-emerald-400">
                    <i className="fas fa-store text-xl ml-3"></i>
                    <span id="store-button-text">متجر البرديات</span>
                </Link>
                <Link href="/tutor" id="tutor-button" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-rose-400 text-rose-400">
                    <i className="fas fa-user-graduate text-xl ml-3"></i>
                    <span id="tutor-button-text">المعلم الخصوصي</span>
                </Link>
                <Link href="/word-scramble" id="word-scramble-button" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-indigo-400 text-indigo-400">
                    <i className="fas fa-random text-xl ml-3"></i>
                    <span id="word-scramble-button-text">تحدي الكلمات</span>
                </Link>
                 <Link href="/dialogue-challenge" id="dialogue-challenge-button" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-purple-400 text-purple-400">
                    <i className="fas fa-comments text-xl ml-3"></i>
                    <span id="dialogue-challenge-button-text">تحدي الحوار</span>
                </Link>
                 <Link href="/pronunciation-challenge" id="pronunciation-challenge-button" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-pink-400 text-pink-400">
                    <i className="fas fa-bullhorn text-xl ml-3"></i>
                    <span id="pronunciation-challenge-button-text">تحدي النطق</span>
                </Link>
            </div>

            <div className="dashboard-card p-6 md:p-10 rounded-2xl">
                <div id="metrics-title" className="text-2xl royal-title mb-6 text-center">
                    إحصائيات التقدم والموارد
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    {/* Stat Cards */}
                    <div className="stat-card p-4 rounded-lg text-center">
                        <i className="fas fa-book-open text-2xl icon-symbol mb-2"></i>
                        <p className="text-3xl font-bold text-white">45</p>
                        <p id="words-mastered-label" className="text-sm text-gray-400">كلمات مُتقنة</p>
                    </div>
                    <div className="stat-card p-4 rounded-lg text-center">
                        <i className="fas fa-gem text-2xl icon-symbol mb-2"></i>
                        <p className="text-3xl font-bold text-white">1200</p>
                        <p id="nile_points_label" className="text-sm text-gray-400">نقاط النيل</p>
                    </div>
                    <div className="stat-card p-4 rounded-lg text-center">
                        <i className="fas fa-calendar-alt text-2xl icon-symbol mb-2"></i>
                        <p className="text-3xl font-bold text-white">7</p>
                        <p id="streak_days_label" className="text-sm text-gray-400">أيام متواصلة</p>
                    </div>
                    <div className="stat-card p-4 rounded-lg text-center">
                        <i className="fas fa-clock text-2xl icon-symbol mb-2"></i>
                        <p className="text-3xl font-bold text-white">3.5</p>
                        <p id="total_time_label" className="text-sm text-gray-400">إجمالي الوقت (س)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h2 id="challenges-title" className="text-2xl royal-title mb-4 text-white pb-2 border-b-2 border-sand-ochre">تحدياتك القادمة</h2>
                        {/* Challenges List */}
                        <div className="space-y-3">
                            <div className="challenge-item p-4 rounded-lg flex items-center justify-between text-white opacity-60">
                                <div className="flex items-center flex-row">
                                    <i className="fas fa-check-circle text-lg text-green-400 ml-3"></i>
                                    <div>
                                        <p className="font-bold text-lg">تحدي النطق الملكي</p>
                                        <p className="text-sm text-gray-300">صباح الخير، أنا كويس.</p>
                                    </div>
                                </div>
                                <span id="completed-label" className="text-sm text-green-400 font-bold">مُكتمل</span>
                            </div>
                            <div className="challenge-item p-4 rounded-lg flex items-center justify-between text-white bg-nile border-gold-accent shadow-xl border-r-4">
                               <div className="flex items-center flex-row">
                                    <i className="fas fa-comments text-lg icon-symbol ml-3"></i>
                                    <div>
                                        <p id="current-challenge-title" className="font-bold text-lg">القصة المصورة: في السوق</p>
                                        <p id="current-challenge-desc" className="text-sm text-gray-300">تدريب على حوارات الشراء والبيع.</p>
                                    </div>
                                </div>
                                <button className="cta-button px-4 py-2 text-sm rounded-full flex items-center">
                                    <span id="start-button-text">ابدأ التحدي التالي</span> <i className="fas fa-chevron-left mr-1"></i>
                                </button>
                            </div>
                             <div className="challenge-item p-4 rounded-lg flex items-center justify-between text-white opacity-80">
                                <div className="flex items-center flex-row">
                                    <i className="fas fa-lightbulb text-lg icon-symbol ml-3"></i>
                                    <div>
                                        <p className="font-bold text-lg">مفردات: الأطعمة والمشروبات</p>
                                        <p className="text-sm text-gray-300">تحدي الذاكرة للمفردات اليومية.</p>
                                    </div>
                                </div>
                                <span id="locked-label" className="text-sm text-sand-ochre font-bold"><i className="fas fa-lock ml-1"></i> مُغلق</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <h2 id="progress-title" className="text-2xl royal-title mb-4 text-white pb-2 border-b-2 border-sand-ochre">تقدم المستوى</h2>
                        {/* Progress Bar */}
                        <div className="progress-bar-royal mb-6">
                            <div className="progress-fill-royal" style={{width: '40%'}}></div>
                        </div>
                        <p className="text-2xl font-bold text-white text-center mb-1">40%</p>
                        <p id="level-progress-text" className="text-sm text-gray-400 text-center mb-6">متبقي لكاتب البردي</p>
                        
                        <h3 id="leaderboard-title" className="text-xl font-bold text-sand-ochre mb-3 text-center">لوحة صدارة الأهرامات</h3>
                        {/* Leaderboard */}
                        <div className="leaderboard-card p-4 rounded-lg text-white space-y-3">
                            <div className="flex items-center justify-between font-bold text-lg text-gold-accent">
                                <div className="flex items-center"><i className="fas fa-trophy mr-2 text-xl"></i><span id="leaderboard_1">الملكة حتشبسوت</span></div>
                                <span>1500 <i className="fas fa-gem text-sm ml-1"></i></span>
                            </div>
                            <div className="flex items-center justify-between text-lg text-gray-300">
                                <div className="flex items-center"><span className="ml-2 w-5 text-center">2.</span><span id="leaderboard_2">امنحتب الحكيم</span></div>
                                <span>1350 <i className="fas fa-gem text-sm ml-1"></i></span>
                            </div>
                            <div className="flex items-center justify-between text-lg font-extrabold text-white bg-[#0b4e8d] p-2 rounded-md border-r-4 border-gold-accent">
                                <div className="flex items-center"><span className="ml-2 w-5 text-center">3.</span><span id="current-user-rank" className="user-alias">{pharaonicAlias}</span></div>
                                <span>1200 <i className="fas fa-gem text-sm ml-1"></i></span>
                            </div>
                            <div className="flex items-center justify-between text-lg text-gray-300">
                                <div className="flex items-center"><span className="ml-2 w-5 text-center">4.</span><span id="leaderboard_4">نفرتيتي الرشيقة</span></div>
                                <span>980 <i className="fas fa-gem text-sm ml-1"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

    

    

    
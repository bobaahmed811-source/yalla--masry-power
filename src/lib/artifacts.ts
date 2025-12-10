import * as THREE from 'three';

export type ArtifactData = {
    title: string;
    description: string;
    puzzle: string;
    position: THREE.Vector3;
    icon: string;
    goal: boolean;
    isExplored: boolean;
};

export type Artifacts = {
    [key: string]: ArtifactData;
};

// Centralized artifact data
export const ARTIFACT_DATA: Artifacts = {
    'mask': {
        title: 'قناع توت عنخ آمون',
        description: 'أشهر قطعة أثرية في العالم. مصنوع من الذهب الخالص ومطعم بالأحجار الكريمة.',
        puzzle: 'لغز: ما هي الألوان الرئيسية التي استخدمها المصريون القدماء لطلاء القناع الذهبي؟',
        position: new THREE.Vector3(0, 0, -150),
        icon: 'fas fa-crown',
        goal: false,
        isExplored: false
    },
    'rosetta': {
        title: 'حجر رشيد',
        description: 'لوحة حجرية حاسمة لفك رموز اللغة الهيروغليفية.',
        puzzle: 'لغز: من هو العالم الفرنسي الذي فك شفرة الحجر في عام 1822؟',
        position: new THREE.Vector3(-150, 0, 0),
        icon: 'fas fa-book-open',
        goal: true,
        isExplored: false
    },
    'canopic': {
        title: 'الأواني الكانوبية',
        description: 'الأواني الأربعة المستخدمة لحفظ الأعضاء الداخلية للمتوفى أثناء عملية التحنيط.',
        puzzle: 'لغز: من هو ابن حورس الذي كان يحمي الرئتين؟',
        position: new THREE.Vector3(150, 0, 0),
        icon: 'fas fa-vial',
        goal: false,
        isExplored: false
    },
    'ramses': {
        title: 'تمثال رمسيس الثاني',
        description: 'تمثال ضخم يمثل فرعوناً عظيماً. اشتهر بحكمه الطويل ومشاريع البناء الهائلة.',
        puzzle: 'لغز: ما هي المعركة الشهيرة التي قادها رمسيس الثاني ضد الحيثيين؟',
        position: new THREE.Vector3(-150, 0, 150),
        icon: 'fas fa-gavel',
        goal: false,
        isExplored: false
    },
    'hatshepsut': {
        title: 'تمثال حتشبسوت',
        description: 'أقوى الحاكمات في التاريخ المصري، حكمت كفرعون كامل.',
        puzzle: 'لغز: ما هو اللقب الذي أطلقته حتشبسوت على نفسها لتأكيد شرعيتها؟',
        position: new THREE.Vector3(150, 0, 150),
        icon: 'fas fa-user-tie',
        goal: false,
        isExplored: false
    },
    'solar_boat': {
        title: 'مركب الشمس',
        description: 'سفينة جنائزية عُثر عليها بجوار الهرم الأكبر. كان الهدف منها نقل روح الفرعون في رحلته الأبدية.',
        puzzle: 'لغز: ما هي المادة الأساسية التي صنع منها المركب بالكامل؟',
        position: new THREE.Vector3(0, 0, 50),
        icon: 'fas fa-ship',
        goal: false,
        isExplored: false
    },
    'tut_dagger': {
        title: 'خنجر توت النيزكي',
        description: 'خنجر استثنائي مصنوع بالكامل من حديد نيزكي (جاء من الفضاء).',
        puzzle: 'لغز: ما هي الميزة غير العادية التي جعلت هذا الخنجر فريداً؟',
        position: new THREE.Vector3(-50, 0, -50),
        icon: 'fas fa-meteor',
        goal: false,
        isExplored: false
    },
    'gold_jewelry': {
        title: 'حُلي توت الذهبية',
        description: 'مجموعة من الأساور والقلادات المصنوعة من الذهب والأحجار الكريمة.',
        puzzle: 'لغز: ما هو رمز الحماية الشائع الذي يظهر في الكثير من الحلي المصرية القديمة؟',
        position: new THREE.Vector3(50, 0, -50),
        icon: 'fas fa-gem',
        goal: false,
        isExplored: false
    },
    'nefertiti_bust': {
        title: 'تمثال نفرتيتي',
        description: 'تمثال نصفي للملكة نفرتيتي، زوجة أخناتون، يُعتبر أيقونة للجمال الأنثوي في العالم القديم.',
        puzzle: 'لغز: ما هي الميزة المفقودة بشكل غامض في إحدى عيني تمثال نفرتيتي؟',
        position: new THREE.Vector3(-150, 0, -150),
        icon: 'fas fa-female',
        goal: false,
        isExplored: false
    },
    'seated_scribe': {
        title: 'الكاتب الجالس',
        description: 'تمثال من الحجر الجيري الملون يصور كاتبًا أثناء عمله، وهو يمثل أهمية التعليم في مصر القديمة.',
        puzzle: 'لغز: ما هي الأداة التي كان يمسك بها الكاتب في يده والتي فقدت مع مرور الزمن؟',
        position: new THREE.Vector3(150, 0, -150),
        icon: 'fas fa-pen-alt',
        goal: false,
        isExplored: false
    },
    'anubis_shrine': {
        title: 'مزار أنوبيس',
        description: 'مزار خشبي مذهّب يصور الإله أنوبيس في هيئة ابن آوى راقد، وهو يحرس كنوز المقبرة.',
        puzzle: 'لغز: ما هو الدور الرئيسي للإله أنوبيس في معتقدات العالم الآخر المصرية؟',
        position: new THREE.Vector3(100, 0, -100),
        icon: 'fas fa-dog',
        goal: false,
        isExplored: false
    },
    'book_of_dead': {
        title: 'بردية كتاب الموتى',
        description: 'مجموعة من النصوص الجنائزية والتعاويذ التي كانت توضع مع المتوفى لمساعدته في رحلته إلى العالم الآخر.',
        puzzle: 'لغز: ما هو الاسم المصري الأصلي لهذه البرديات، والذي يعني "الخروج في النهار"؟',
        position: new THREE.Vector3(-100, 0, 100),
        icon: 'fas fa-scroll',
        goal: false,
        isExplored: false
    }
};

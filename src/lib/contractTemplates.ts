export const DEFAULT_DEBT_CONTRACT_TEMPLATES: Record<string, string> = {
  ru: `РАСПИСКА О ДОЛГЕ №{{number}}

г. {{city}}                                                              {{date}}

Я, нижеподписавшийся(аяся) _________________________ (Ф.И.О. получателя, заполняется вручную),
подтверждаю, что получил(а) от {{companyName}} денежные средства в размере:

{{amount}} {{currency}}

Дата получения: {{takenDate}}
Срок возврата: {{dueDate}}
Комментарий: {{comment}}

Обязуюсь вернуть указанную сумму в полном объёме в установленный срок.

ОТВЕТСТВЕННОСТЬ И РАЗРЕШЕНИЕ СПОРОВ
В случае невозврата суммы в установленный срок стороны разрешают споры путём переговоров,
а при недостижении согласия — в порядке, установленном действующим законодательством.

ДОПОЛНИТЕЛЬНЫЕ УСЛОВИЯ
{{customClauses}}

Займодавец: {{companyName}}
{{companyDetails}}

Получатель (подпись): _________________________
(заполняется получателем собственноручно)

Займодавец (подпись): _________________________`,

  uz: `QARZ TILXATI №{{number}}

{{city}} sh.                                                              {{date}}

Men, quyida imzo chekuvchi _________________________ (oluvchining F.I.Sh., qo'lda to'ldiriladi),
{{companyName}}dan quyidagi miqdorda pul mablag'ini olganligimni tasdiqlayman:

{{amount}} {{currency}}

Olingan sana: {{takenDate}}
Qaytarish muddati: {{dueDate}}
Izoh: {{comment}}

Ko'rsatilgan summani belgilangan muddatda to'liq qaytarishga majburman.

MAS'ULIYAT VA NIZOLARNI HAL QILISH
Summa belgilangan muddatda qaytarilmagan taqdirda, tomonlar nizolarni muzokaralar orqali,
kelishuvga erishilmasa esa amaldagi qonunchilikda belgilangan tartibda hal qiladilar.

QO'SHIMCHA SHARTLAR
{{customClauses}}

Qarz beruvchi: {{companyName}}
{{companyDetails}}

Oluvchi (imzo): _________________________
(oluvchi tomonidan qo'lda to'ldiriladi)

Qarz beruvchi (imzo): _________________________`,

  tj: `РАСХАТИ ҚАРЗ №{{number}}

ш. {{city}}                                                              {{date}}

Ман, имзокунандаи зерин _________________________ (Ф.И.Ш.-и гиранда, бо дасти худ пур карда мешавад),
тасдиқ мекунам, ки аз {{companyName}} маблағи пулиро ба андозаи зерин гирифтам:

{{amount}} {{currency}}

Санаи гирифтан: {{takenDate}}
Мӯҳлати баргардонидан: {{dueDate}}
Шарҳ: {{comment}}

Ӯҳдадор мешавам маблағи зикршударо дар мӯҳлати муайяншуда пурра баргардонам.

МАСЪУЛИЯТ ВА ҲАЛЛИ БАҲСҲО
Дар сурати баргардонида нашудани маблағ дар мӯҳлати муайяншуда, тарафҳо баҳсҳоро тавассути
музокирот ҳал мекунанд, ва дар сурати ба мувофиқа нарасидан — тибқи қонунгузории амалкунанда.

ШАРТҲОИ ИЛОВАГӢ
{{customClauses}}

Қарздиҳанда: {{companyName}}
{{companyDetails}}

Гиранда (имзо): _________________________
(бо дасти худи гиранда пур карда мешавад)

Қарздиҳанда (имзо): _________________________`,

  kz: `ҚАРЫЗ ТУРАЛЫ РАСПИСКА №{{number}}

{{city}} қ.                                                              {{date}}

Мен, төменде қол қоюшы _________________________ (алушының Т.А.Ә., қолмен толтырылады),
{{companyName}}-дан мына мөлшерде ақша қаражатын алғанымды растаймын:

{{amount}} {{currency}}

Алынған күні: {{takenDate}}
Қайтару мерзімі: {{dueDate}}
Түсініктеме: {{comment}}

Көрсетілген соманы белгіленген мерзімде толық қайтаруға міндеттенемін.

ЖАУАПКЕРШІЛІК ЖӘНЕ ДАУЛАРДЫ ШЕШУ
Сома белгіленген мерзімде қайтарылмаған жағдайда, тараптар дауларды келіссөздер арқылы,
ал келісімге қол жеткізілмесе — қолданыстағы заңнамада белгіленген тәртіппен шешеді.

ҚОСЫМША ШАРТТАР
{{customClauses}}

Қарыз беруші: {{companyName}}
{{companyDetails}}

Алушы (қолы): _________________________
(алушы өз қолымен толтырады)

Қарыз беруші (қолы): _________________________`,

  kg: `КАРЫЗ ТУУРАЛУУ РАСПИСКА №{{number}}

{{city}} ш.                                                              {{date}}

Мен, төмөндө кол коюучу _________________________ (алуучунун Ф.А.А., колу менен толтурулат),
{{companyName}}дан төмөнкү өлчөмдө акча каражатын алганымды ырастайм:

{{amount}} {{currency}}

Алынган күнү: {{takenDate}}
Кайтаруу мөөнөтү: {{dueDate}}
Комментарий: {{comment}}

Көрсөтүлгөн суманы белгиленген мөөнөттө толук кайтарууга милдеттенем.

ЖООПКЕРЧИЛИК ЖАНА ТАЛАШТАРДЫ ЧЕЧҮҮ
Сумма белгиленген мөөнөттө кайтарылбаган учурда, тараптар талаштарды сүйлөшүүлөр аркылуу,
ал эми макулдашууга жетишилбесе — колдонуудагы мыйзамдарда белгиленген тартипте чечишет.

КОШУМЧА ШАРТТАР
{{customClauses}}

Карыз берүүчү: {{companyName}}
{{companyDetails}}

Алуучу (колу): _________________________
(алуучу тарабынан колу менен толтурулат)

Карыз берүүчү (колу): _________________________`,
};

export const DEFAULT_CREDIT_CONTRACT_TEMPLATES: Record<string, string> = {
  ru: `ДОГОВОР ЗАЙМА №{{number}}

г. {{city}}                                                              {{date}}

{{companyName}}, именуемый(ая) в дальнейшем "Займодавец", с одной стороны, и
_________________________ (Ф.И.О. получателя, заполняется вручную), именуемый(ая) в
дальнейшем "Заёмщик", с другой стороны, заключили настоящий договор о нижеследующем:

1. ПРЕДМЕТ ДОГОВОРА
Займодавец передаёт Заёмщику заём в размере {{amount}} {{currency}}, а Заёмщик обязуется
вернуть указанную сумму в порядке и сроки, установленные настоящим договором.

2. УСЛОВИЯ ЗАЙМА
Номер кредита: {{number}}
Сумма займа: {{amount}} {{currency}}
Тип процента: {{interestType}}
Процентная ставка: {{rate}}
Срок займа: {{term}}
Дата выдачи: {{takenDate}}
Ежемесячный платёж: {{monthlyPayment}} {{currency}}

3. ДАННЫЕ ЗАЁМЩИКА
Паспортные данные: {{passport}}
Адрес: {{address}}
Телефон: {{phone}}

4. ОТВЕТСТВЕННОСТЬ СТОРОН
За несвоевременный возврат суммы займа Заёмщик несёт ответственность в соответствии с
условиями настоящего договора и действующим законодательством. Споры по настоящему
договору решаются путём переговоров, а при недостижении согласия — в установленном порядке.

5. ДОПОЛНИТЕЛЬНЫЕ УСЛОВИЯ
{{customClauses}}

6. РЕКВИЗИТЫ СТОРОН

Займодавец: {{companyName}}
{{companyDetails}}
Подпись: _________________________

Заёмщик: _________________________
(Ф.И.О. и подпись заполняются получателем собственноручно)
Подпись: _________________________`,

  uz: `QARZ (KREDIT) SHARTNOMASI №{{number}}

{{city}} sh.                                                              {{date}}

{{companyName}}, bundan buyon "Qarz beruvchi" deb ataluvchi, bir tomondan, va
_________________________ (oluvchining F.I.Sh., qo'lda to'ldiriladi), bundan buyon
"Qarz oluvchi" deb ataluvchi, ikkinchi tomondan, ushbu shartnomani quyidagilar to'g'risida tuzdilar:

1. SHARTNOMA PREDMETI
Qarz beruvchi Qarz oluvchiga {{amount}} {{currency}} miqdorida qarz beradi, Qarz oluvchi esa
ko'rsatilgan summani ushbu shartnomada belgilangan tartib va muddatlarda qaytarishga majbur.

2. QARZ SHARTLARI
Kredit raqami: {{number}}
Qarz summasi: {{amount}} {{currency}}
Foiz turi: {{interestType}}
Foiz stavkasi: {{rate}}
Qarz muddati: {{term}}
Berilgan sana: {{takenDate}}
Oylik to'lov: {{monthlyPayment}} {{currency}}

3. QARZ OLUVCHI MA'LUMOTLARI
Pasport ma'lumotlari: {{passport}}
Manzil: {{address}}
Telefon: {{phone}}

4. TOMONLARNING MAS'ULIYATI
Qarz summasini o'z vaqtida qaytarmaganlik uchun Qarz oluvchi ushbu shartnoma shartlari va
amaldagi qonunchilikka muvofiq javobgar bo'ladi. Ushbu shartnoma bo'yicha nizolar muzokaralar
orqali, kelishuvga erishilmasa — belgilangan tartibda hal qilinadi.

5. QO'SHIMCHA SHARTLAR
{{customClauses}}

6. TOMONLAR REKVIZITLARI

Qarz beruvchi: {{companyName}}
{{companyDetails}}
Imzo: _________________________

Qarz oluvchi: _________________________
(F.I.Sh. va imzo oluvchi tomonidan qo'lda to'ldiriladi)
Imzo: _________________________`,

  tj: `ШАРТНОМАИ ҚАРЗ №{{number}}

ш. {{city}}                                                              {{date}}

{{companyName}}, минбаъд "Қарздиҳанда" номида, аз як тараф, ва
_________________________ (Ф.И.Ш.-и гиранда, бо дасти худ пур карда мешавад), минбаъд
"Қарзгиранда" номида, аз тарафи дигар, ин шартномаро дар бораи зерин бастанд:

1. МАВЗӯИ ШАРТНОМА
Қарздиҳанда ба Қарзгиранда қарзи ба андозаи {{amount}} {{currency}} медиҳад, Қарзгиранда бошад
уҳдадор мешавад маблағи зикршударо дар тартиб ва мӯҳлати муайяншудаи ин шартнома баргардонад.

2. ШАРТҲОИ ҚАРЗ
Рақами кредит: {{number}}
Маблағи қарз: {{amount}} {{currency}}
Навъи фоиз: {{interestType}}
Меъёри фоиз: {{rate}}
Мӯҳлати қарз: {{term}}
Санаи додашуда: {{takenDate}}
Пардохти моҳона: {{monthlyPayment}} {{currency}}

3. МАЪЛУМОТИ ҚАРЗГИРАНДА
Маълумоти шиноснома: {{passport}}
Суроға: {{address}}
Телефон: {{phone}}

4. МАСЪУЛИЯТИ ТАРАФҲО
Барои баргардонида нашудани маблағи қарз дар мӯҳлат Қарзгиранда тибқи шартҳои ин шартнома
ва қонунгузории амалкунанда масъул аст. Баҳсҳо тавассути музокирот, дар сурати ба
мувофиқа нарасидан — тибқи тартиби муқарраршуда ҳал карда мешаванд.

5. ШАРТҲОИ ИЛОВАГӢ
{{customClauses}}

6. РЕКВИЗИТИ ТАРАФҲО

Қарздиҳанда: {{companyName}}
{{companyDetails}}
Имзо: _________________________

Қарзгиранда: _________________________
(Ф.И.Ш. ва имзо аз ҷониби гиранда бо дасти худ пур карда мешавад)
Имзо: _________________________`,

  kz: `ҚАРЫЗ (НЕСИЕ) ШАРТЫ №{{number}}

{{city}} қ.                                                              {{date}}

{{companyName}}, бұдан былай "Қарыз беруші" деп аталатын, бір тараптан, және
_________________________ (алушының Т.А.Ә., қолмен толтырылады), бұдан былай
"Қарыз алушы" деп аталатын, екінші тараптан, осы шартты төмендегілер туралы жасасты:

1. ШАРТ МӘНІ
Қарыз беруші Қарыз алушыға {{amount}} {{currency}} мөлшерінде қарыз береді, ал Қарыз алушы
көрсетілген соманы осы шартта белгіленген тәртіп пен мерзімде қайтаруға міндеттенеді.

2. ҚАРЫЗ ШАРТТАРЫ
Несие нөмірі: {{number}}
Қарыз сомасы: {{amount}} {{currency}}
Пайыз түрі: {{interestType}}
Пайыздық мөлшерлеме: {{rate}}
Қарыз мерзімі: {{term}}
Берілген күні: {{takenDate}}
Ай сайынғы төлем: {{monthlyPayment}} {{currency}}

3. ҚАРЫЗ АЛУШЫ ДЕРЕКТЕРІ
Паспорт деректері: {{passport}}
Мекенжайы: {{address}}
Телефоны: {{phone}}

4. ТАРАПТАРДЫҢ ЖАУАПКЕРШІЛІГІ
Қарыз сомасын уақтылы қайтармағаны үшін Қарыз алушы осы шарт талаптарына және қолданыстағы
заңнамаға сәйкес жауапты болады. Осы шарт бойынша даулар келіссөздер арқылы, келісімге
қол жеткізілмесе — белгіленген тәртіппен шешіледі.

5. ҚОСЫМША ШАРТТАР
{{customClauses}}

6. ТАРАПТАРДЫҢ ДЕРЕКТЕМЕЛЕРІ

Қарыз беруші: {{companyName}}
{{companyDetails}}
Қолы: _________________________

Қарыз алушы: _________________________
(Т.А.Ә. және қолы алушы өз қолымен толтырады)
Қолы: _________________________`,

  kg: `КАРЫЗ (КРЕДИТ) ШАРТЫ №{{number}}

{{city}} ш.                                                              {{date}}

{{companyName}}, мындан ары "Карыз берүүчү" деп аталуучу, бир тараптан, жана
_________________________ (алуучунун Ф.А.А., колу менен толтурулат), мындан ары
"Карыз алуучу" деп аталуучу, экинчи тараптан, ушул келишимди төмөнкүлөр жөнүндө түзүштү:

1. КЕЛИШИМДИН ПРЕДМЕТИ
Карыз берүүчү Карыз алуучуга {{amount}} {{currency}} өлчөмүндө карыз берет, ал эми Карыз алуучу
көрсөтүлгөн суманы ушул келишимде белгиленген тартипте жана мөөнөттө кайтарууга милдеттенет.

2. КАРЫЗ ШАРТТАРЫ
Кредит номери: {{number}}
Карыз суммасы: {{amount}} {{currency}}
Пайыз түрү: {{interestType}}
Пайыздык чен: {{rate}}
Карыз мөөнөтү: {{term}}
Берилген күнү: {{takenDate}}
Айлык төлөм: {{monthlyPayment}} {{currency}}

3. КАРЫЗ АЛУУЧУ ТУУРАЛУУ МААЛЫМАТ
Паспорт маалыматы: {{passport}}
Дареги: {{address}}
Телефону: {{phone}}

4. ТАРАПТАРДЫН ЖООПКЕРЧИЛИГИ
Карыз суммасын өз убагында кайтарбаганы үчүн Карыз алуучу ушул келишимдин шарттарына жана
колдонуудагы мыйзамдарга ылайык жооптуу болот. Ушул келишим боюнча талаштар сүйлөшүүлөр
аркылуу, макулдашууга жетишилбесе — белгиленген тартипте чечилет.

5. КОШУМЧА ШАРТТАР
{{customClauses}}

6. ТАРАПТАРДЫН РЕКВИЗИТТЕРИ

Карыз берүүчү: {{companyName}}
{{companyDetails}}
Колу: _________________________

Карыз алуучу: _________________________
(Ф.А.А. жана колу алуучу тарабынан колу менен толтурулат)
Колу: _________________________`,
};

export const DEFAULT_DEBT_CONTRACT_TEMPLATE = DEFAULT_DEBT_CONTRACT_TEMPLATES.ru;
export const DEFAULT_CREDIT_CONTRACT_TEMPLATE = DEFAULT_CREDIT_CONTRACT_TEMPLATES.ru;

export function getDefaultDebtTemplate(lang: string): string {
  return DEFAULT_DEBT_CONTRACT_TEMPLATES[lang] ?? DEFAULT_DEBT_CONTRACT_TEMPLATES.ru;
}

export function getDefaultCreditTemplate(lang: string): string {
  return DEFAULT_CREDIT_CONTRACT_TEMPLATES[lang] ?? DEFAULT_CREDIT_CONTRACT_TEMPLATES.ru;
}

export interface ContractVars {
  number: string | number;
  city?: string;
  date: string;
  amount: string;
  currency: string;
  takenDate: string;
  dueDate?: string;
  comment?: string;
  companyName: string;
  companyDetails?: string;
  interestType?: string;
  rate?: string;
  term?: string;
  monthlyPayment?: string;
  passport?: string;
  address?: string;
  phone?: string;
  customClauses?: string;
}

/** Подставляет переменные {{ключ}} в текст шаблона. Отсутствующие значения — тире. */
export function fillTemplate(template: string, vars: ContractVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = (vars as any)[key];
    return v !== undefined && v !== null && v !== '' ? String(v) : '—';
  });
}

"use client";

import Link from "next/link";
import "./vyslovnost.css";
import { useEffect, useMemo, useRef, useState } from "react";

const LESSONS = {
  "cs": {
    "label": "Čeština",
    "flag": "🇨🇿",
    "speechCode": "cs-CZ",
    "recognitionCode": "cs-CZ",
    "categories": {
      "zaklady": {
        "label": "Základní věty",
        "items": [
          [
            "Dobrý den, jak se máte?",
            "Добрый день, как вы поживаете?",
            "Zřetelně vyslovte dlouhé á ve slově „máte“."
          ],
          [
            "Jmenuji se Anna.",
            "Меня зовут Анна.",
            "Slovo „jmenuji“ vyslovte plynule jako jeden celek."
          ],
          [
            "Bydlím v Brně.",
            "Я живу в Брно.",
            "Zaměřte se na české ř ve slově „Brně“."
          ],
          [
            "Prosím, můžete mi pomoci?",
            "Пожалуйста, вы можете мне помочь?",
            "Ve slově „můžete“ držte dlouhé ů."
          ],
          [
            "Děkuji vám za pomoc.",
            "Спасибо вам за помощь.",
            "Dávejte pozor na měkké dě ve slově „děkuji“."
          ],
          [
            "Nerozumím, můžete to zopakovat?",
            "Я не понимаю, можете это повторить?",
            "Ve slově „nerozumím“ vyslovte dlouhé í."
          ],
          [
            "Mluvte prosím pomaleji.",
            "Говорите, пожалуйста, медленнее.",
            "Slovo „pomaleji“ vyslovujte po slabikách po-ma-le-ji."
          ],
          [
            "Kolik je hodin?",
            "Который час?",
            "Otázku zakončete mírně stoupající intonací."
          ],
          [
            "Dnes je krásné počasí.",
            "Сегодня прекрасная погода.",
            "Ve slově „krásné“ držte dlouhé á."
          ],
          [
            "Přeji vám hezký den.",
            "Желаю вам хорошего дня.",
            "Procvičte české ř ve slově „přeji“."
          ]
        ]
      },
      "prace": {
        "label": "Práce",
        "items": [
          [
            "Pracuji jako výrobní plánovač.",
            "Я работаю планировщиком производства.",
            "Slovo „výrobní“ vyslovte s dlouhým ý."
          ],
          [
            "Dnes mám pracovní poradu.",
            "Сегодня у меня рабочее совещание.",
            "Rozdělte větu na dvě kratší části."
          ],
          [
            "Potřebuji dokončit tento úkol.",
            "Мне нужно закончить это задание.",
            "Procvičte skupinu tř ve slově „potřebuji“."
          ],
          [
            "Můžeme se domluvit na zítřek?",
            "Можем договориться на завтра?",
            "Ve slově „zítřek“ vyslovte zřetelně ř."
          ],
          [
            "Pošlete mi prosím ten dokument.",
            "Отправьте мне, пожалуйста, этот документ.",
            "Dbejte na zřetelné zakončení slov „prosím“ a „dokument“."
          ],
          [
            "Kdy bude projekt dokončen?",
            "Когда проект будет завершён?",
            "Ve slově „dokončen“ vyslovte měkké č."
          ],
          [
            "Musíme zkontrolovat výrobní plán.",
            "Мы должны проверить производственный план.",
            "Vyslovte pomalu spojení „zkontrolovat výrobní“."
          ],
          [
            "Dnes pracuji z domova.",
            "Сегодня я работаю из дома.",
            "Ve slově „pracuji“ nepřeskakujte prostřední slabiku."
          ],
          [
            "Mám několik důležitých úkolů.",
            "У меня несколько важных задач.",
            "Procvičte dlouhé ů ve slově „úkolů“."
          ],
          [
            "Porada začne v devět hodin.",
            "Совещание начнётся в девять часов.",
            "Zřetelně oddělte slova „devět hodin“."
          ]
        ]
      },
      "obchod": {
        "label": "Obchod a restaurace",
        "items": [
          [
            "Kolik to stojí?",
            "Сколько это стоит?",
            "Otázku zakončete stoupající intonací."
          ],
          [
            "Prosím jednu kávu s mlékem.",
            "Один кофе с молоком, пожалуйста.",
            "Ve slově „kávu“ držte dlouhé á."
          ],
          [
            "Mohu zaplatit kartou?",
            "Можно заплатить картой?",
            "Vyslovujte jasně každou slabiku: za-pla-tit."
          ],
          [
            "Účet, prosím.",
            "Счёт, пожалуйста.",
            "Dlouhé ú na začátku slova vyslovte zřetelně."
          ],
          [
            "Máte něco bez cukru?",
            "У вас есть что-нибудь без сахара?",
            "Ve slově „cukru“ vyslovte jasné krátké u."
          ],
          [
            "Chtěl bych si objednat oběd.",
            "Я хотел бы заказать обед.",
            "Procvičte skupinu cht ve slově „chtěl“."
          ],
          [
            "Toto jídlo je velmi chutné.",
            "Это блюдо очень вкусное.",
            "Ve slově „chutné“ vyslovte české ch."
          ],
          [
            "Kde jsou zkušební kabinky?",
            "Где находятся примерочные?",
            "Vyslovte pomalu slovo „zkušební“."
          ],
          [
            "Potřebuji jinou velikost.",
            "Мне нужен другой размер.",
            "Zdůrazněte první slabiku ve slově „potřebuji“."
          ],
          [
            "Mohu to prosím vyměnit?",
            "Можно это, пожалуйста, обменять?",
            "Procvičte měkké ni ve slově „vyměnit“."
          ]
        ]
      },
      "cestovani": {
        "label": "Cestování",
        "items": [
          [
            "Kde je vlakové nádraží?",
            "Где железнодорожный вокзал?",
            "Ve slově „nádraží“ držte dlouhé á a í."
          ],
          [
            "V kolik hodin odjíždí vlak?",
            "Во сколько отправляется поезд?",
            "Procvičte měkké dí ve slově „odjíždí“."
          ],
          [
            "Chtěl bych jednu jízdenku do Prahy.",
            "Я хотел бы один билет до Праги.",
            "Ve slově „jízdenku“ vyslovte dlouhé í."
          ],
          [
            "Je tento autobus přímý?",
            "Этот автобус прямой?",
            "Dbejte na dlouhé ý ve slově „přímý“."
          ],
          [
            "Jak dlouho trvá cesta?",
            "Сколько длится поездка?",
            "Otázku vyslovte plynule bez dlouhých pauz."
          ],
          [
            "Kde musím přestoupit?",
            "Где мне нужно пересесть?",
            "Procvičte české ř ve slově „přestoupit“."
          ],
          [
            "Mám rezervaci na dvě noci.",
            "У меня бронь на две ночи.",
            "Zřetelně vyslovte spojení „dvě noci“."
          ],
          [
            "Můžete mi zavolat taxi?",
            "Можете вызвать мне такси?",
            "Ve slově „zavolat“ nepřeskakujte slabiku vo."
          ],
          [
            "Hledám centrum města.",
            "Я ищу центр города.",
            "Vyslovte krátce a jasně slovo „města“."
          ],
          [
            "Kdy odlétá naše letadlo?",
            "Когда вылетает наш самолёт?",
            "Ve slově „odlétá“ držte dlouhé é a á."
          ]
        ]
      },
      "volnycas": {
        "label": "Volný čas",
        "items": [
          [
            "Ve volném čase rád čtu.",
            "В свободное время я люблю читать.",
            "Vyslovte jasně skupinu čt ve slově „čtu“."
          ],
          [
            "O víkendu chodím na procházky.",
            "На выходных я хожу гулять.",
            "Slovo „procházky“ vyslovte pomalu po slabikách."
          ],
          [
            "Mám rád hudbu a filmy.",
            "Я люблю музыку и фильмы.",
            "Dbejte na krátké a ve spojení „mám rád“."
          ],
          [
            "Každé ráno trochu cvičím.",
            "Каждое утро я немного занимаюсь спортом.",
            "Procvičte měkké č ve slově „cvičím“."
          ],
          [
            "Rád vařím pro svou rodinu.",
            "Я люблю готовить для своей семьи.",
            "Ve slově „vařím“ vyslovte zřetelné ř."
          ],
          [
            "V létě často jezdíme k moři.",
            "Летом мы часто ездим к морю.",
            "Dlouhé é ve slově „létě“ vyslovte zřetelně."
          ],
          [
            "Mým koníčkem je kreslení.",
            "Моё хобби — рисование.",
            "Ve slově „koníčkem“ držte dlouhé í."
          ],
          [
            "Večer poslouchám audioknihy.",
            "Вечером я слушаю аудиокниги.",
            "Slovo „audioknihy“ rozdělte na au-di-o-kni-hy."
          ],
          [
            "Rád poznávám nová místa.",
            "Я люблю узнавать новые места.",
            "Vyslovte dlouhé á ve slově „poznávám“."
          ],
          [
            "Dnes si chci trochu odpočinout.",
            "Сегодня я хочу немного отдохнуть.",
            "Procvičte skupinu chci bez vložené samohlásky."
          ]
        ]
      },
      "zdravi": {
        "label": "Zdraví",
        "items": [
          [
            "Necítím se dnes dobře.",
            "Сегодня я плохо себя чувствую.",
            "Ve slově „necítím“ vyslovte dlouhé í."
          ],
          [
            "Bolí mě hlava.",
            "У меня болит голова.",
            "Vyslovte zřetelně dlouhé í ve slově „bolí“."
          ],
          [
            "Potřebuji navštívit lékaře.",
            "Мне нужно посетить врача.",
            "Procvičte skupinu ř ve slově „lékaře“."
          ],
          [
            "Mám zvýšenou teplotu.",
            "У меня повышенная температура.",
            "Slovo „zvýšenou“ vyslovte po slabikách."
          ],
          [
            "Beru léky dvakrát denně.",
            "Я принимаю лекарства два раза в день.",
            "Ve slově „dvakrát“ držte dlouhé á."
          ],
          [
            "Jsem alergický na pyl.",
            "У меня аллергия на пыльцу.",
            "Slovo „alergický“ vyslovte pomalu a zřetelně."
          ],
          [
            "Kde je nejbližší lékárna?",
            "Где ближайшая аптека?",
            "Ve slově „nejbližší“ vyslovte zřetelně žš."
          ],
          [
            "Potřebuji si odpočinout.",
            "Мне нужно отдохнуть.",
            "Procvičte skupinu tř ve slově „potřebuji“."
          ],
          [
            "Dnes se cítím mnohem lépe.",
            "Сегодня я чувствую себя намного лучше.",
            "Ve slově „lépe“ držte dlouhé é."
          ],
          [
            "Mám objednanou kontrolu.",
            "У меня назначен контрольный осмотр.",
            "Vyslovte plynule spojení „objednanou kontrolu“."
          ]
        ]
      },
      "domacnost": {
        "label": "Domácnost",
        "items": [
          [
            "Musím uklidit kuchyň.",
            "Мне нужно убрать кухню.",
            "Ve slově „kuchyň“ vyslovte měkké ň."
          ],
          [
            "Pračka právě dopírala.",
            "Стиральная машина только что закончила стирку.",
            "Procvičte skupinu právě bez vložené samohlásky."
          ],
          [
            "Potřebuji koupit nový vysavač.",
            "Мне нужно купить новый пылесос.",
            "Ve slově „vysavač“ vyslovte jasné č."
          ],
          [
            "Dnes budu vařit večeři.",
            "Сегодня я буду готовить ужин.",
            "Ve slově „večeři“ vyslovte zřetelné ř."
          ],
          [
            "Prosím zavřete okno.",
            "Пожалуйста, закройте окно.",
            "Procvičte skupinu vř ve slově „zavřete“."
          ],
          [
            "V obývacím pokoji je chladno.",
            "В гостиной прохладно.",
            "Slovo „obývacím“ vyslovte s dlouhým ý."
          ],
          [
            "Musíme vyměnit žárovku.",
            "Нам нужно заменить лампочку.",
            "Ve slově „žárovku“ držte dlouhé á."
          ],
          [
            "Nádobí je už umyté.",
            "Посуда уже вымыта.",
            "Vyslovte dlouhé á ve slově „nádobí“."
          ],
          [
            "Kde jsou čisté ručníky?",
            "Где чистые полотенца?",
            "Ve slově „ručníky“ vyslovte skupinu čn."
          ],
          [
            "Zítra budeme prát prádlo.",
            "Завтра мы будем стирать бельё.",
            "Dbejte na rozdíl mezi krátkým a dlouhým á."
          ]
        ]
      },
      "urady": {
        "label": "Úřady a služby",
        "items": [
          [
            "Potřebuji vyplnit tento formulář.",
            "Мне нужно заполнить эту форму.",
            "Ve slově „formulář“ vyslovte zřetelné ř."
          ],
          [
            "Kde mohu podat žádost?",
            "Где я могу подать заявление?",
            "Ve slově „žádost“ držte dlouhé á."
          ],
          [
            "Mám s sebou všechny doklady.",
            "У меня с собой все документы.",
            "Vyslovte plynule spojení „s sebou“."
          ],
          [
            "Kdy má úřad otevřeno?",
            "Когда учреждение открыто?",
            "Procvičte české ř ve slově „úřad“."
          ],
          [
            "Potřebuji nové potvrzení.",
            "Мне нужна новая справка.",
            "Ve slově „potvrzení“ vyslovte měkké ní."
          ],
          [
            "Mohu se objednat přes internet?",
            "Можно записаться через интернет?",
            "Vyslovte zřetelně každou slabiku slova „objednat“."
          ],
          [
            "Kde je nejbližší pošta?",
            "Где ближайшая почта?",
            "Ve slově „nejbližší“ nepřeskakujte prostřední slabiky."
          ],
          [
            "Chci poslat doporučený dopis.",
            "Я хочу отправить заказное письмо.",
            "Slovo „doporučený“ vyslovte pomalu."
          ],
          [
            "Potřebuji ověřit podpis.",
            "Мне нужно заверить подпись.",
            "Procvičte ř ve slově „ověřit“."
          ],
          [
            "Kdy bude žádost vyřízena?",
            "Когда заявление будет рассмотрено?",
            "Ve slově „vyřízena“ vyslovte obě ř zřetelně."
          ]
        ]
      },
      "telefon": {
        "label": "Telefon a internet",
        "items": [
          [
            "Můžete mi zavolat později?",
            "Можете позвонить мне позже?",
            "Ve slově „později“ vyslovte měkké dě."
          ],
          [
            "Teď nemohu mluvit.",
            "Сейчас я не могу говорить.",
            "Vyslovte krátce a jasně slovo „teď“."
          ],
          [
            "Pošlete mi prosím zprávu.",
            "Отправьте мне, пожалуйста, сообщение.",
            "Ve slově „zprávu“ vyslovte skupinu zpr bez vložené samohlásky."
          ],
          [
            "Nemám připojení k internetu.",
            "У меня нет подключения к интернету.",
            "Procvičte skupinu př ve slově „připojení“."
          ],
          [
            "Signál je dnes velmi slabý.",
            "Сегодня сигнал очень слабый.",
            "Ve slově „slabý“ držte dlouhé ý."
          ],
          [
            "Zapomněl jsem heslo.",
            "Я забыл пароль.",
            "Ve slově „zapomněl“ vyslovte měkké ň."
          ],
          [
            "Můžete mi poslat odkaz?",
            "Можете отправить мне ссылку?",
            "Otázku zakončete stoupající intonací."
          ],
          [
            "Videohovor se přerušil.",
            "Видеозвонок прервался.",
            "Procvičte ř ve slově „přerušil“."
          ],
          [
            "Potřebuji nabít telefon.",
            "Мне нужно зарядить телефон.",
            "Ve slově „nabít“ držte dlouhé í."
          ],
          [
            "Aplikace se nechce otevřít.",
            "Приложение не хочет открываться.",
            "Ve slově „otevřít“ vyslovte skupinu vř."
          ]
        ]
      },
      "spolecnost": {
        "label": "Lidé a společnost",
        "items": [
          [
            "Rád poznávám nové lidi.",
            "Я люблю знакомиться с новыми людьми.",
            "Ve slově „poznávám“ držte dlouhé á."
          ],
          [
            "Můj soused je velmi přátelský.",
            "Мой сосед очень дружелюбный.",
            "Procvičte ř ve slově „přátelský“."
          ],
          [
            "O víkendu navštívíme přátele.",
            "На выходных мы навестим друзей.",
            "Vyslovte zřetelně skupinu př ve slově „přátele“."
          ],
          [
            "Můžeme si tykat?",
            "Можем перейти на ты?",
            "Otázku vyslovte přirozeně a lehce stoupavě."
          ],
          [
            "Rád trávím čas s rodinou.",
            "Я люблю проводить время с семьёй.",
            "Ve slově „trávím“ držte dlouhé á a í."
          ],
          [
            "Dnes máme rodinnou oslavu.",
            "Сегодня у нас семейный праздник.",
            "Slovo „rodinnou“ vyslovte se dvěma n."
          ],
          [
            "Bylo příjemné vás poznat.",
            "Было приятно с вами познакомиться.",
            "Procvičte ř ve slově „příjemné“."
          ],
          [
            "Můžeme se sejít příští týden?",
            "Можем встретиться на следующей неделе?",
            "Ve slově „příští“ vyslovte skupinu řš."
          ],
          [
            "Děti si hrají na zahradě.",
            "Дети играют в саду.",
            "Ve slově „zahradě“ vyslovte měkké dě."
          ],
          [
            "Všichni se dobře bavili.",
            "Все хорошо провели время.",
            "Ve slově „všichni“ vyslovte skupinu vš."
          ]
        ]
      }
    }
  },
  "en": {
    "label": "Angličtina",
    "flag": "🇬🇧",
    "speechCode": "en-US",
    "recognitionCode": "en-US",
    "categories": {
      "basics": {
        "label": "Základní věty",
        "items": [
          [
            "Hello, how are you today?",
            "Ahoj, jak se dnes máš?",
            "Ve slově „how“ vyslovte dvojhlásku /aʊ/."
          ],
          [
            "My name is Karel.",
            "Jmenuji se Karel.",
            "Slovo „name“ má dlouhou samohlásku /eɪ/."
          ],
          [
            "I live in the Czech Republic.",
            "Žiji v České republice.",
            "Ve slově „live“ je krátké /ɪ/."
          ],
          [
            "Could you help me, please?",
            "Mohl byste mi prosím pomoci?",
            "Ve slově „could“ se písmeno l nevyslovuje."
          ],
          [
            "Thank you very much.",
            "Mockrát děkuji.",
            "Procvičte zvuk /θ/ ve slově „thank“."
          ],
          [
            "I do not understand.",
            "Nerozumím.",
            "Slovo „understand“ má přízvuk na poslední slabice."
          ],
          [
            "Could you say that again?",
            "Mohl byste to zopakovat?",
            "Spojte plynule slova „say that“."
          ],
          [
            "Please speak more slowly.",
            "Mluvte prosím pomaleji.",
            "Ve slově „slowly“ vyslovte dvojhlásku /oʊ/."
          ],
          [
            "What time is it?",
            "Kolik je hodin?",
            "Ve slově „what“ vyslovte krátké /ɒ/ nebo /ʌ/ dle přízvuku."
          ],
          [
            "Have a nice day.",
            "Přeji hezký den.",
            "Slovo „nice“ vyslovte s dvojhláskou /aɪ/."
          ]
        ]
      },
      "work": {
        "label": "Práce",
        "items": [
          [
            "I work as a production planner.",
            "Pracuji jako výrobní plánovač.",
            "Ve slově „work“ vyslovte anglické r jen jemně."
          ],
          [
            "We have a meeting this afternoon.",
            "Dnes odpoledne máme poradu.",
            "Ve slově „meeting“ je dlouhé /iː/."
          ],
          [
            "I need to finish this task today.",
            "Potřebuji dnes dokončit tento úkol.",
            "Slovo „task“ zakončete jasným k."
          ],
          [
            "Can we discuss the new project?",
            "Můžeme probrat nový projekt?",
            "Ve slově „discuss“ je přízvuk na druhé slabice."
          ],
          [
            "Please send me the document.",
            "Pošlete mi prosím dokument.",
            "Ve slově „document“ je přízvuk na první slabice."
          ],
          [
            "When will the project be completed?",
            "Kdy bude projekt dokončen?",
            "Spojte plynule „will the“."
          ],
          [
            "We must check the production plan.",
            "Musíme zkontrolovat výrobní plán.",
            "Ve slově „production“ je přízvuk na druhé slabice."
          ],
          [
            "I am working from home today.",
            "Dnes pracuji z domova.",
            "Ve slově „working“ vyslovte koncovku -ing."
          ],
          [
            "I have several important tasks.",
            "Mám několik důležitých úkolů.",
            "Ve slově „important“ je přízvuk na druhé slabice."
          ],
          [
            "The meeting starts at nine o'clock.",
            "Porada začíná v devět hodin.",
            "Dbejte na spojení „starts at“."
          ]
        ]
      },
      "shopping": {
        "label": "Obchod a restaurace",
        "items": [
          [
            "How much does it cost?",
            "Kolik to stojí?",
            "Ve slově „much“ vyslovte krátké /ʌ/."
          ],
          [
            "I would like a coffee with milk.",
            "Dal bych si kávu s mlékem.",
            "Spojte plynule „would like“."
          ],
          [
            "Can I pay by card?",
            "Mohu zaplatit kartou?",
            "Ve slově „card“ vyslovte dlouhé /ɑː/."
          ],
          [
            "Could I have the bill, please?",
            "Mohl bych dostat účet?",
            "Ve slově „bill“ je krátké /ɪ/."
          ],
          [
            "Do you have anything without sugar?",
            "Máte něco bez cukru?",
            "Slovo „without“ má přízvuk na druhé slabice."
          ],
          [
            "I would like to order lunch.",
            "Chtěl bych si objednat oběd.",
            "Ve slově „order“ vyslovte zřetelné r podle přízvuku."
          ],
          [
            "This meal is very tasty.",
            "Toto jídlo je velmi chutné.",
            "Ve slově „tasty“ vyslovte /eɪ/."
          ],
          [
            "Where are the fitting rooms?",
            "Kde jsou zkušební kabinky?",
            "Spojení „fitting rooms“ vyslovte bez dlouhé pauzy."
          ],
          [
            "I need a different size.",
            "Potřebuji jinou velikost.",
            "Ve slově „different“ nepřehánějte prostřední samohlásku."
          ],
          [
            "Can I exchange this, please?",
            "Mohu to prosím vyměnit?",
            "Ve slově „exchange“ je přízvuk na druhé slabice."
          ]
        ]
      },
      "travel": {
        "label": "Cestování",
        "items": [
          [
            "Where is the train station?",
            "Kde je vlakové nádraží?",
            "Ve slově „where“ začněte znělým w."
          ],
          [
            "What time does the train leave?",
            "V kolik hodin odjíždí vlak?",
            "Slovo „leave“ má dlouhé /iː/."
          ],
          [
            "I would like a ticket to Prague.",
            "Chtěl bych jízdenku do Prahy.",
            "Spojte „ticket to“ plynule."
          ],
          [
            "Is this a direct bus?",
            "Je tento autobus přímý?",
            "Ve slově „direct“ je přízvuk obvykle na druhé slabice."
          ],
          [
            "How long does the journey take?",
            "Jak dlouho trvá cesta?",
            "Ve slově „journey“ začněte zvukem /dʒ/."
          ],
          [
            "Where do I need to change?",
            "Kde musím přestoupit?",
            "Slovo „change“ začíná zvukem /tʃ/."
          ],
          [
            "I have a reservation for two nights.",
            "Mám rezervaci na dvě noci.",
            "Ve slově „reservation“ je přízvuk na třetí slabice."
          ],
          [
            "Could you call a taxi for me?",
            "Můžete mi zavolat taxi?",
            "Spojte plynule „call a“."
          ],
          [
            "I am looking for the city centre.",
            "Hledám centrum města.",
            "Ve slově „centre“ vyslovte jemné schwa na konci."
          ],
          [
            "When does our flight depart?",
            "Kdy odlétá naše letadlo?",
            "Slovo „depart“ má přízvuk na druhé slabice."
          ]
        ]
      },
      "freeTime": {
        "label": "Volný čas",
        "items": [
          [
            "I like reading in my free time.",
            "Ve volném čase rád čtu.",
            "Ve slově „reading“ je dlouhé /iː/."
          ],
          [
            "I go for walks at the weekend.",
            "O víkendu chodím na procházky.",
            "Spojte plynule „go for“."
          ],
          [
            "I enjoy music and films.",
            "Mám rád hudbu a filmy.",
            "Ve slově „enjoy“ je přízvuk na druhé slabice."
          ],
          [
            "I exercise a little every morning.",
            "Každé ráno trochu cvičím.",
            "Ve slově „exercise“ je přízvuk na první slabice."
          ],
          [
            "I like cooking for my family.",
            "Rád vařím pro svou rodinu.",
            "Ve slově „cooking“ vyslovte krátké /ʊ/."
          ],
          [
            "We often travel to the seaside in summer.",
            "V létě často jezdíme k moři.",
            "Ve slově „often“ může být t nevyslovené."
          ],
          [
            "Drawing is my favourite hobby.",
            "Mým oblíbeným koníčkem je kreslení.",
            "Ve slově „drawing“ vyslovte začátek /drɔː/."
          ],
          [
            "I listen to audiobooks in the evening.",
            "Večer poslouchám audioknihy.",
            "Spojte plynule „listen to“."
          ],
          [
            "I enjoy discovering new places.",
            "Rád poznávám nová místa.",
            "Ve slově „discovering“ je přízvuk na druhé slabice."
          ],
          [
            "I want to relax a little today.",
            "Dnes si chci trochu odpočinout.",
            "Spojte „want to“ přirozeně, ale srozumitelně."
          ]
        ]
      },
      "health": {
        "label": "Zdraví",
        "items": [
          [
            "I do not feel well today.",
            "Dnes se necítím dobře.",
            "Spojte plynule „do not“ a vyslovte krátké /ɪ/ ve slově „feel“."
          ],
          [
            "I have a headache.",
            "Bolí mě hlava.",
            "Ve slově „headache“ je přízvuk na první slabice."
          ],
          [
            "I need to see a doctor.",
            "Potřebuji navštívit lékaře.",
            "Spojte plynule „see a“."
          ],
          [
            "I have a high temperature.",
            "Mám zvýšenou teplotu.",
            "Ve slově „temperature“ se některé slabiky vyslovují velmi krátce."
          ],
          [
            "I take this medicine twice a day.",
            "Beru tento lék dvakrát denně.",
            "Ve slově „medicine“ je přízvuk na první slabice."
          ],
          [
            "I am allergic to pollen.",
            "Jsem alergický na pyl.",
            "Ve slově „allergic“ je přízvuk na druhé slabice."
          ],
          [
            "Where is the nearest pharmacy?",
            "Kde je nejbližší lékárna?",
            "Ve slově „pharmacy“ se ph vyslovuje jako f."
          ],
          [
            "I need to get some rest.",
            "Potřebuji si odpočinout.",
            "Spojte přirozeně „get some“."
          ],
          [
            "I feel much better today.",
            "Dnes se cítím mnohem lépe.",
            "Ve slově „better“ je krátké /e/."
          ],
          [
            "I have a medical appointment.",
            "Mám objednanou lékařskou kontrolu.",
            "Ve slově „appointment“ je přízvuk na druhé slabice."
          ]
        ]
      },
      "home": {
        "label": "Domácnost",
        "items": [
          [
            "I need to clean the kitchen.",
            "Musím uklidit kuchyň.",
            "Ve slově „kitchen“ se t téměř nevyslovuje samostatně."
          ],
          [
            "The washing machine has finished.",
            "Pračka právě dopírala.",
            "Ve slově „washing“ vyslovte koncovku -ing."
          ],
          [
            "I need to buy a new vacuum cleaner.",
            "Potřebuji koupit nový vysavač.",
            "Ve slově „vacuum“ vyslovte dvě samohláskové části."
          ],
          [
            "I am cooking dinner tonight.",
            "Dnes večer vařím večeři.",
            "Ve slově „dinner“ vyslovte krátké /ɪ/."
          ],
          [
            "Please close the window.",
            "Prosím zavřete okno.",
            "Ve slově „close“ je znělé z na konci."
          ],
          [
            "It is cold in the living room.",
            "V obývacím pokoji je chladno.",
            "Spojte plynule „in the“."
          ],
          [
            "We need to change the light bulb.",
            "Musíme vyměnit žárovku.",
            "Ve slově „bulb“ vyslovte koncové b."
          ],
          [
            "The dishes are already clean.",
            "Nádobí je už čisté.",
            "Slovo „dishes“ zakončete zvukem /ɪz/."
          ],
          [
            "Where are the clean towels?",
            "Kde jsou čisté ručníky?",
            "Ve slově „towels“ vyslovte dvě slabiky."
          ],
          [
            "We are doing the laundry tomorrow.",
            "Zítra budeme prát prádlo.",
            "Ve slově „laundry“ vyslovte začátek /lɔːn/."
          ]
        ]
      },
      "services": {
        "label": "Úřady a služby",
        "items": [
          [
            "I need to fill in this form.",
            "Potřebuji vyplnit tento formulář.",
            "Spojte přirozeně „fill in“."
          ],
          [
            "Where can I submit my application?",
            "Kde mohu podat žádost?",
            "Ve slově „application“ je přízvuk na třetí slabice."
          ],
          [
            "I have all the necessary documents.",
            "Mám všechny potřebné doklady.",
            "Ve slově „necessary“ je přízvuk na první slabice."
          ],
          [
            "What time does the office open?",
            "Kdy má úřad otevřeno?",
            "Spojte plynule „does the“."
          ],
          [
            "I need a new confirmation letter.",
            "Potřebuji nové potvrzení.",
            "Ve slově „confirmation“ je přízvuk na třetí slabice."
          ],
          [
            "Can I book an appointment online?",
            "Mohu se objednat přes internet?",
            "Ve slově „appointment“ je přízvuk na druhé slabice."
          ],
          [
            "Where is the nearest post office?",
            "Kde je nejbližší pošta?",
            "Spojte plynule „post office“."
          ],
          [
            "I would like to send a registered letter.",
            "Chci poslat doporučený dopis.",
            "Ve slově „registered“ některé slabiky vyslovte krátce."
          ],
          [
            "I need to have my signature verified.",
            "Potřebuji ověřit podpis.",
            "Ve slově „verified“ je přízvuk na první slabice."
          ],
          [
            "When will my application be processed?",
            "Kdy bude žádost vyřízena?",
            "Ve slově „processed“ vyslovte koncové t."
          ]
        ]
      },
      "phone": {
        "label": "Telefon a internet",
        "items": [
          [
            "Could you call me later?",
            "Můžete mi zavolat později?",
            "Spojte plynule „call me“."
          ],
          [
            "I cannot talk right now.",
            "Teď nemohu mluvit.",
            "Ve slově „right“ se gh nevyslovuje."
          ],
          [
            "Please send me a message.",
            "Pošlete mi prosím zprávu.",
            "Ve slově „message“ je přízvuk na první slabice."
          ],
          [
            "I do not have an internet connection.",
            "Nemám připojení k internetu.",
            "Ve slově „connection“ je přízvuk na druhé slabice."
          ],
          [
            "The signal is very weak today.",
            "Signál je dnes velmi slabý.",
            "Ve slově „weak“ je dlouhé /iː/."
          ],
          [
            "I forgot my password.",
            "Zapomněl jsem heslo.",
            "Ve slově „forgot“ je přízvuk na druhé slabice."
          ],
          [
            "Could you send me the link?",
            "Můžete mi poslat odkaz?",
            "Ve slově „link“ zakončete jasným k."
          ],
          [
            "The video call was disconnected.",
            "Videohovor se přerušil.",
            "Ve slově „disconnected“ je přízvuk na třetí slabice."
          ],
          [
            "I need to charge my phone.",
            "Potřebuji nabít telefon.",
            "Ve slově „charge“ začněte zvukem /tʃ/."
          ],
          [
            "The application will not open.",
            "Aplikace se nechce otevřít.",
            "Ve slově „application“ je přízvuk na třetí slabice."
          ]
        ]
      },
      "people": {
        "label": "Lidé a společnost",
        "items": [
          [
            "I enjoy meeting new people.",
            "Rád poznávám nové lidi.",
            "Ve slově „meeting“ je dlouhé /iː/."
          ],
          [
            "My neighbour is very friendly.",
            "Můj soused je velmi přátelský.",
            "Ve slově „neighbour“ se gh nevyslovuje."
          ],
          [
            "We are visiting friends this weekend.",
            "O víkendu navštívíme přátele.",
            "Ve slově „visiting“ je přízvuk na první slabice."
          ],
          [
            "Can we use first names?",
            "Můžeme si tykat?",
            "Ve slově „names“ vyslovte koncové z."
          ],
          [
            "I like spending time with my family.",
            "Rád trávím čas s rodinou.",
            "Spojte plynule „time with“."
          ],
          [
            "We have a family celebration today.",
            "Dnes máme rodinnou oslavu.",
            "Ve slově „celebration“ je přízvuk na třetí slabice."
          ],
          [
            "It was nice to meet you.",
            "Bylo příjemné vás poznat.",
            "Spojte přirozeně „nice to meet you“."
          ],
          [
            "Can we meet next week?",
            "Můžeme se sejít příští týden?",
            "Ve slově „week“ je dlouhé /iː/."
          ],
          [
            "The children are playing in the garden.",
            "Děti si hrají na zahradě.",
            "Ve slově „children“ vyslovte dvě slabiky."
          ],
          [
            "Everyone had a good time.",
            "Všichni se dobře bavili.",
            "Ve slově „everyone“ je přízvuk na první slabice."
          ]
        ]
      }
    }
  },
  "de": {
    "label": "Němčina",
    "flag": "🇩🇪",
    "speechCode": "de-DE",
    "recognitionCode": "de-DE",
    "categories": {
      "grundlagen": {
        "label": "Základní věty",
        "items": [
          [
            "Guten Tag, wie geht es Ihnen?",
            "Dobrý den, jak se máte?",
            "Ve slově „geht“ vyslovte dlouhé é."
          ],
          [
            "Ich heiße Karel.",
            "Jmenuji se Karel.",
            "Procvičte německé ch ve slově „ich“."
          ],
          [
            "Ich wohne in Brünn.",
            "Bydlím v Brně.",
            "Přehlasované ü vyslovte se zaokrouhlenými rty."
          ],
          [
            "Können Sie mir bitte helfen?",
            "Můžete mi prosím pomoci?",
            "Ve slově „können“ vyslovte jasné ö."
          ],
          [
            "Vielen Dank für Ihre Hilfe.",
            "Mockrát děkuji za vaši pomoc.",
            "Ve slově „vielen“ se v vyslovuje jako f."
          ],
          [
            "Ich verstehe das nicht.",
            "Nerozumím tomu.",
            "Ve slově „verstehe“ je přízvuk na druhé slabice."
          ],
          [
            "Können Sie das bitte wiederholen?",
            "Můžete to prosím zopakovat?",
            "Slovo „wiederholen“ vyslovte po částech."
          ],
          [
            "Bitte sprechen Sie langsamer.",
            "Mluvte prosím pomaleji.",
            "Ve slově „sprechen“ procvičte skupinu ch."
          ],
          [
            "Wie spät ist es?",
            "Kolik je hodin?",
            "Ve slově „spät“ vyslovte dlouhé ä."
          ],
          [
            "Ich wünsche Ihnen einen schönen Tag.",
            "Přeji vám hezký den.",
            "Ve slově „schönen“ vyslovte ö se zaokrouhlenými rty."
          ]
        ]
      },
      "arbeit": {
        "label": "Práce",
        "items": [
          [
            "Ich arbeite als Produktionsplaner.",
            "Pracuji jako výrobní plánovač.",
            "Přízvuk ve slově „arbeite“ je na první slabice."
          ],
          [
            "Heute haben wir eine Besprechung.",
            "Dnes máme poradu.",
            "Ve slově „Besprechung“ procvičte skupinu ch."
          ],
          [
            "Ich muss diese Aufgabe heute beenden.",
            "Musím dnes dokončit tento úkol.",
            "Ve slově „Aufgabe“ vyslovte dvojhlásku au."
          ],
          [
            "Können wir das Projekt besprechen?",
            "Můžeme probrat projekt?",
            "Otázku zakončete mírně stoupající intonací."
          ],
          [
            "Bitte schicken Sie mir das Dokument.",
            "Pošlete mi prosím dokument.",
            "Ve slově „schicken“ vyslovte krátké i."
          ],
          [
            "Wann wird das Projekt fertig sein?",
            "Kdy bude projekt dokončen?",
            "Spojte plynule „wird das“."
          ],
          [
            "Wir müssen den Produktionsplan prüfen.",
            "Musíme zkontrolovat výrobní plán.",
            "Ve slově „prüfen“ vyslovte jasné ü."
          ],
          [
            "Heute arbeite ich von zu Hause.",
            "Dnes pracuji z domova.",
            "Dbejte na slovosled „arbeite ich“."
          ],
          [
            "Ich habe mehrere wichtige Aufgaben.",
            "Mám několik důležitých úkolů.",
            "Ve slově „wichtige“ procvičte měkké ch."
          ],
          [
            "Die Besprechung beginnt um neun Uhr.",
            "Porada začíná v devět hodin.",
            "Ve slově „beginnt“ je přízvuk na druhé slabice."
          ]
        ]
      },
      "einkaufen": {
        "label": "Obchod a restaurace",
        "items": [
          [
            "Wie viel kostet das?",
            "Kolik to stojí?",
            "Slovo „kostet“ vyslovte se zřetelným t."
          ],
          [
            "Ich hätte gern einen Kaffee mit Milch.",
            "Dal bych si kávu s mlékem.",
            "Ve slově „hätte“ vyslovte otevřené ä."
          ],
          [
            "Kann ich mit Karte bezahlen?",
            "Mohu zaplatit kartou?",
            "Ve slově „bezahlen“ je přízvuk na druhé slabice."
          ],
          [
            "Die Rechnung, bitte.",
            "Účet, prosím.",
            "Ve slově „Rechnung“ procvičte skupinu ch."
          ],
          [
            "Haben Sie etwas ohne Zucker?",
            "Máte něco bez cukru?",
            "Slovo „Zucker“ začíná zvukem ts."
          ],
          [
            "Ich möchte das Mittagessen bestellen.",
            "Chtěl bych si objednat oběd.",
            "Ve slově „möchte“ vyslovte jasné ö."
          ],
          [
            "Dieses Essen schmeckt sehr gut.",
            "Toto jídlo je velmi chutné.",
            "Ve slově „schmeckt“ vyslovte koncové kt."
          ],
          [
            "Wo sind die Umkleidekabinen?",
            "Kde jsou zkušební kabinky?",
            "Slovo „Umkleidekabinen“ rozdělte na části."
          ],
          [
            "Ich brauche eine andere Größe.",
            "Potřebuji jinou velikost.",
            "Ve slově „Größe“ vyslovte dlouhé ö."
          ],
          [
            "Kann ich das bitte umtauschen?",
            "Mohu to prosím vyměnit?",
            "Ve slově „umtauschen“ vyslovte dvojhlásku au."
          ]
        ]
      },
      "reisen": {
        "label": "Cestování",
        "items": [
          [
            "Wo ist der Bahnhof?",
            "Kde je nádraží?",
            "Ve slově „Bahnhof“ držte dlouhé á."
          ],
          [
            "Wann fährt der Zug ab?",
            "Kdy odjíždí vlak?",
            "Ve slově „fährt“ vyslovte dlouhé ä."
          ],
          [
            "Ich möchte eine Fahrkarte nach Prag.",
            "Chtěl bych jízdenku do Prahy.",
            "Ve slově „Fahrkarte“ vyslovte dlouhé a."
          ],
          [
            "Ist das ein direkter Bus?",
            "Je to přímý autobus?",
            "Ve slově „direkter“ vyslovte jasné k."
          ],
          [
            "Wie lange dauert die Reise?",
            "Jak dlouho trvá cesta?",
            "Ve slově „Reise“ vyslovte dvojhlásku ai."
          ],
          [
            "Wo muss ich umsteigen?",
            "Kde musím přestoupit?",
            "Ve slově „umsteigen“ vyslovte dvojhlásku ai."
          ],
          [
            "Ich habe eine Reservierung für zwei Nächte.",
            "Mám rezervaci na dvě noci.",
            "Ve slově „Nächte“ procvičte ä a ch."
          ],
          [
            "Können Sie mir ein Taxi rufen?",
            "Můžete mi zavolat taxi?",
            "Ve slově „rufen“ vyslovte dlouhé u."
          ],
          [
            "Ich suche das Stadtzentrum.",
            "Hledám centrum města.",
            "Ve slově „Stadtzentrum“ vyslovte zřetelně skupinu dtz."
          ],
          [
            "Wann fliegt unser Flugzeug ab?",
            "Kdy odlétá naše letadlo?",
            "Ve slově „Flugzeug“ vyslovte dvojhlásku oi."
          ]
        ]
      },
      "freizeit": {
        "label": "Volný čas",
        "items": [
          [
            "In meiner Freizeit lese ich gern.",
            "Ve volném čase rád čtu.",
            "Slovo „Freizeit“ obsahuje dvojhlásku ai."
          ],
          [
            "Am Wochenende gehe ich spazieren.",
            "O víkendu chodím na procházky.",
            "Ve slově „spazieren“ je přízvuk na druhé slabice."
          ],
          [
            "Ich mag Musik und Filme.",
            "Mám rád hudbu a filmy.",
            "Ve slově „Musik“ je přízvuk na druhé slabice."
          ],
          [
            "Jeden Morgen mache ich etwas Sport.",
            "Každé ráno trochu cvičím.",
            "Ve slově „Morgen“ vyslovte jasné r podle německého přízvuku."
          ],
          [
            "Ich koche gern für meine Familie.",
            "Rád vařím pro svou rodinu.",
            "Ve slově „koche“ procvičte ch."
          ],
          [
            "Im Sommer fahren wir oft ans Meer.",
            "V létě často jezdíme k moři.",
            "Ve slově „fahren“ držte dlouhé a."
          ],
          [
            "Zeichnen ist mein Lieblingshobby.",
            "Mým oblíbeným koníčkem je kreslení.",
            "Ve slově „zeichnen“ vyslovte začátek ts."
          ],
          [
            "Abends höre ich Hörbücher.",
            "Večer poslouchám audioknihy.",
            "Ve slově „Hörbücher“ procvičte ö a ü."
          ],
          [
            "Ich entdecke gern neue Orte.",
            "Rád poznávám nová místa.",
            "Ve slově „entdecke“ je přízvuk na druhé slabice."
          ],
          [
            "Heute möchte ich mich etwas entspannen.",
            "Dnes si chci trochu odpočinout.",
            "Ve slově „entspannen“ vyslovte skupinu tsp."
          ]
        ]
      },
      "gesundheit": {
        "label": "Zdraví",
        "items": [
          [
            "Ich fühle mich heute nicht gut.",
            "Dnes se necítím dobře.",
            "Ve slově „fühle“ vyslovte dlouhé ü."
          ],
          [
            "Ich habe Kopfschmerzen.",
            "Bolí mě hlava.",
            "Slovo „Kopfschmerzen“ rozdělte na dvě části."
          ],
          [
            "Ich muss zum Arzt gehen.",
            "Musím jít k lékaři.",
            "Ve slově „Arzt“ vyslovte zřetelně koncové t."
          ],
          [
            "Ich habe erhöhte Temperatur.",
            "Mám zvýšenou teplotu.",
            "Ve slově „erhöhte“ vyslovte jasné ö."
          ],
          [
            "Ich nehme dieses Medikament zweimal täglich.",
            "Beru tento lék dvakrát denně.",
            "Ve slově „täglich“ procvičte ä a ch."
          ],
          [
            "Ich bin gegen Pollen allergisch.",
            "Jsem alergický na pyl.",
            "Ve slově „allergisch“ je přízvuk na druhé slabice."
          ],
          [
            "Wo ist die nächste Apotheke?",
            "Kde je nejbližší lékárna?",
            "Ve slově „nächste“ procvičte ä a ch."
          ],
          [
            "Ich muss mich etwas ausruhen.",
            "Potřebuji si odpočinout.",
            "Ve slově „ausruhen“ vyslovte dvojhlásku au."
          ],
          [
            "Heute fühle ich mich viel besser.",
            "Dnes se cítím mnohem lépe.",
            "Ve slově „besser“ vyslovte krátké e."
          ],
          [
            "Ich habe einen Termin beim Arzt.",
            "Mám objednanou kontrolu u lékaře.",
            "Spojte plynule „beim Arzt“."
          ]
        ]
      },
      "haushalt": {
        "label": "Domácnost",
        "items": [
          [
            "Ich muss die Küche putzen.",
            "Musím uklidit kuchyň.",
            "Ve slově „Küche“ vyslovte ü a měkké ch."
          ],
          [
            "Die Waschmaschine ist fertig.",
            "Pračka právě dopírala.",
            "Ve slově „Waschmaschine“ vyslovte sch jako š."
          ],
          [
            "Ich brauche einen neuen Staubsauger.",
            "Potřebuji nový vysavač.",
            "Ve slově „Staubsauger“ vyslovte dvojhlásku au."
          ],
          [
            "Heute koche ich das Abendessen.",
            "Dnes vařím večeři.",
            "Ve slově „Abendessen“ je přízvuk na první slabice."
          ],
          [
            "Bitte schließen Sie das Fenster.",
            "Prosím zavřete okno.",
            "Ve slově „schließen“ vyslovte dlouhé í."
          ],
          [
            "Im Wohnzimmer ist es kalt.",
            "V obývacím pokoji je chladno.",
            "Slovo „Wohnzimmer“ rozdělte na dvě části."
          ],
          [
            "Wir müssen die Glühbirne wechseln.",
            "Musíme vyměnit žárovku.",
            "Ve slově „Glühbirne“ vyslovte dlouhé ü."
          ],
          [
            "Das Geschirr ist schon sauber.",
            "Nádobí je už čisté.",
            "Ve slově „Geschirr“ procvičte skupinu sch."
          ],
          [
            "Wo sind die sauberen Handtücher?",
            "Kde jsou čisté ručníky?",
            "Ve slově „Handtücher“ vyslovte ü a ch."
          ],
          [
            "Morgen waschen wir die Wäsche.",
            "Zítra budeme prát prádlo.",
            "Dbejte na rozdíl mezi krátkým a dlouhým ä."
          ]
        ]
      },
      "behoerden": {
        "label": "Úřady a služby",
        "items": [
          [
            "Ich muss dieses Formular ausfüllen.",
            "Potřebuji vyplnit tento formulář.",
            "Ve slově „ausfüllen“ vyslovte dvojhlásku au a ü."
          ],
          [
            "Wo kann ich den Antrag abgeben?",
            "Kde mohu podat žádost?",
            "Ve slově „Antrag“ je přízvuk na první slabice."
          ],
          [
            "Ich habe alle notwendigen Dokumente dabei.",
            "Mám s sebou všechny potřebné doklady.",
            "Ve slově „notwendigen“ vyslovte všechny slabiky zřetelně."
          ],
          [
            "Wann öffnet das Amt?",
            "Kdy má úřad otevřeno?",
            "Ve slově „öffnet“ vyslovte jasné ö."
          ],
          [
            "Ich brauche eine neue Bestätigung.",
            "Potřebuji nové potvrzení.",
            "Ve slově „Bestätigung“ vyslovte dlouhé ä."
          ],
          [
            "Kann ich online einen Termin vereinbaren?",
            "Mohu se objednat přes internet?",
            "Ve slově „vereinbaren“ je přízvuk na druhé slabice."
          ],
          [
            "Wo ist die nächste Post?",
            "Kde je nejbližší pošta?",
            "Ve slově „nächste“ procvičte ä a ch."
          ],
          [
            "Ich möchte einen Einschreibebrief schicken.",
            "Chci poslat doporučený dopis.",
            "Slovo „Einschreibebrief“ rozdělte na části."
          ],
          [
            "Ich muss meine Unterschrift beglaubigen lassen.",
            "Potřebuji ověřit podpis.",
            "Ve slově „Unterschrift“ vyslovte skupinu schr."
          ],
          [
            "Wann wird mein Antrag bearbeitet?",
            "Kdy bude žádost vyřízena?",
            "Ve slově „bearbeitet“ je přízvuk na druhé slabice."
          ]
        ]
      },
      "telefon": {
        "label": "Telefon a internet",
        "items": [
          [
            "Können Sie mich später anrufen?",
            "Můžete mi zavolat později?",
            "Ve slově „später“ vyslovte dlouhé ä."
          ],
          [
            "Ich kann gerade nicht sprechen.",
            "Teď nemohu mluvit.",
            "Ve slově „sprechen“ procvičte ch."
          ],
          [
            "Bitte schicken Sie mir eine Nachricht.",
            "Pošlete mi prosím zprávu.",
            "Ve slově „Nachricht“ vyslovte měkké ch."
          ],
          [
            "Ich habe keine Internetverbindung.",
            "Nemám připojení k internetu.",
            "Slovo „Internetverbindung“ rozdělte na části."
          ],
          [
            "Das Signal ist heute sehr schwach.",
            "Signál je dnes velmi slabý.",
            "Ve slově „schwach“ vyslovte sch jako š a ch měkce."
          ],
          [
            "Ich habe mein Passwort vergessen.",
            "Zapomněl jsem heslo.",
            "Ve slově „vergessen“ je přízvuk na druhé slabice."
          ],
          [
            "Können Sie mir den Link schicken?",
            "Můžete mi poslat odkaz?",
            "Ve slově „schicken“ vyslovte krátké i."
          ],
          [
            "Der Videoanruf wurde unterbrochen.",
            "Videohovor se přerušil.",
            "Ve slově „unterbrochen“ procvičte ch."
          ],
          [
            "Ich muss mein Handy aufladen.",
            "Potřebuji nabít telefon.",
            "Ve slově „aufladen“ vyslovte dvojhlásku au."
          ],
          [
            "Die App lässt sich nicht öffnen.",
            "Aplikace se nechce otevřít.",
            "Ve slově „öffnen“ vyslovte jasné ö."
          ]
        ]
      },
      "menschen": {
        "label": "Lidé a společnost",
        "items": [
          [
            "Ich lerne gern neue Leute kennen.",
            "Rád poznávám nové lidi.",
            "Spojte plynule „Leute kennen“."
          ],
          [
            "Mein Nachbar ist sehr freundlich.",
            "Můj soused je velmi přátelský.",
            "Ve slově „freundlich“ vyslovte dvojhlásku oi."
          ],
          [
            "Wir besuchen am Wochenende Freunde.",
            "O víkendu navštívíme přátele.",
            "Ve slově „besuchen“ je přízvuk na druhé slabice."
          ],
          [
            "Können wir uns duzen?",
            "Můžeme si tykat?",
            "Ve slově „duzen“ vyslovte dlouhé u."
          ],
          [
            "Ich verbringe gern Zeit mit meiner Familie.",
            "Rád trávím čas s rodinou.",
            "Ve slově „verbringe“ je přízvuk na druhé slabice."
          ],
          [
            "Heute haben wir eine Familienfeier.",
            "Dnes máme rodinnou oslavu.",
            "Slovo „Familienfeier“ rozdělte na části."
          ],
          [
            "Es war schön, Sie kennenzulernen.",
            "Bylo příjemné vás poznat.",
            "Ve slově „schön“ vyslovte dlouhé ö."
          ],
          [
            "Können wir uns nächste Woche treffen?",
            "Můžeme se sejít příští týden?",
            "Ve slově „nächste“ procvičte ä a ch."
          ],
          [
            "Die Kinder spielen im Garten.",
            "Děti si hrají na zahradě.",
            "Ve slově „Kinder“ vyslovte krátké i."
          ],
          [
            "Alle hatten eine gute Zeit.",
            "Všichni se dobře bavili.",
            "Spojte plynule „gute Zeit“."
          ]
        ]
      }
    }
  }
};

function cleanText(value) {
  return value
    .toLocaleLowerCase()
    .replace(/[.,!?;:„“"()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function distance(a, b) {
  const first = cleanText(a);
  const second = cleanText(b);
  const matrix = Array.from({ length: first.length + 1 }, () =>
    Array(second.length + 1).fill(0)
  );

  for (let i = 0; i <= first.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= second.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= first.length; i += 1) {
    for (let j = 1; j <= second.length; j += 1) {
      const cost = first[i - 1] === second[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[first.length][second.length];
}

function scoreSpeech(target, spoken) {
  const a = cleanText(target);
  const b = cleanText(spoken);
  if (!a || !b) return 0;
  return Math.max(
    0,
    Math.round((1 - distance(a, b) / Math.max(a.length, b.length)) * 100)
  );
}

function feedback(score) {
  if (score >= 90) return ["🏆", "Výborná výslovnost!", "excellent"];
  if (score >= 75) return ["👏", "Velmi dobré", "good"];
  if (score >= 50) return ["🙂", "Dobrý pokus", "medium"];
  return ["🎯", "Zkuste to znovu", "practice"];
}

export default function PronunciationPage() {
  const [languageKey, setLanguageKey] = useState("cs");
  const [categoryKey, setCategoryKey] = useState("zaklady");
  const [index, setIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ attempts: 0, best: 0, successful: 0 });
  const recognitionRef = useRef(null);

  const language = LESSONS[languageKey];
  const category = language.categories[categoryKey];
  const item = category.items[index];
  const progress = useMemo(
    () => Math.round(((index + 1) / category.items.length) * 100),
    [index, category.items.length]
  );

  useEffect(() => {
    const saved = localStorage.getItem("pronunciationStats");
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch {
        localStorage.removeItem("pronunciationStats");
      }
    }
  }, []);

  function updateStats(score) {
    const next = {
      attempts: stats.attempts + 1,
      best: Math.max(stats.best, score),
      successful: stats.successful + (score >= 75 ? 1 : 0),
    };
    setStats(next);
    localStorage.setItem("pronunciationStats", JSON.stringify(next));
  }

  function speak(rate = 0.9) {
    if (!("speechSynthesis" in window)) {
      setError("Tento prohlížeč nepodporuje hlasové předčítání.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item[0]);
    utterance.lang = language.speechCode;
    utterance.rate = rate;

    const prefix = language.speechCode.slice(0, 2).toLowerCase();
    const voice = window.speechSynthesis
      .getVoices()
      .find((candidate) => candidate.lang.toLowerCase().startsWith(prefix));

    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  function evaluate(spoken) {
    const score = scoreSpeech(item[0], spoken);
    const [emoji, title, className] = feedback(score);
    updateStats(score);
    setResult({ spoken, score, emoji, title, className });
    setLiveText("");
  }

  function startListening() {
    setError("");
    setResult(null);
    setLiveText("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Rozpoznávání řeči není podporováno. Použijte Google Chrome nebo Microsoft Edge."
      );
      return;
    }

    window.speechSynthesis?.cancel();
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = language.recognitionCode;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += text;
        else interim += text;
      }

      setLiveText(finalText || interim);
      if (finalText.trim()) evaluate(finalText);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        setError("Povolte mikrofon v adresním řádku prohlížeče.");
      } else if (event.error === "no-speech") {
        setError("Nebyla rozpoznána žádná řeč. Zkuste mluvit hlasitěji.");
      } else {
        setError(`Rozpoznávání řeči se nepodařilo: ${event.error}`);
      }
    };

    recognition.start();
  }

  function changeLanguage(nextLanguage) {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    const firstCategory = Object.keys(LESSONS[nextLanguage].categories)[0];
    setLanguageKey(nextLanguage);
    setCategoryKey(firstCategory);
    setIndex(0);
    setResult(null);
    setError("");
  }

  function changeCategory(nextCategory) {
    setCategoryKey(nextCategory);
    setIndex(0);
    setResult(null);
    setError("");
  }

  function move(direction) {
    const length = category.items.length;
    setIndex((current) => (current + direction + length) % length);
    setResult(null);
    setError("");
    setLiveText("");
  }

  return (
    <main className="pronunciationPage">
      <section className="pronunciationContainer">
        <div className="pronunciationTopbar">
          <Link href="/" className="pronunciationBackLink">
            ← Zpět na hlavní stránku
          </Link>
          <button
            type="button"
            className="pronunciationRandomButton"
            onClick={() => {
              setIndex(Math.floor(Math.random() * category.items.length));
              setResult(null);
            }}
          >
            🎲 Náhodná věta
          </button>
        </div>

        <header className="pronunciationHeader">
          <div className="pronunciationHeaderIcon">🗣️</div>
          <h1>Trénink výslovnosti</h1>
          <p>
            Poslechněte si vzor, zopakujte větu do mikrofonu a zobrazí se
            orientační hodnocení srozumitelnosti.
          </p>
        </header>

        <div className="pronunciationLanguageTabs">
          {Object.entries(LESSONS).map(([key, value]) => (
            <button
              key={key}
              type="button"
              className={`pronunciationLanguageButton ${
                languageKey === key ? "active" : ""
              }`}
              onClick={() => changeLanguage(key)}
            >
              {value.flag} {value.label}
            </button>
          ))}
        </div>

        <div className="pronunciationCategoryTabs">
          {Object.entries(language.categories).map(([key, value]) => (
            <button
              key={key}
              type="button"
              className={`pronunciationCategoryButton ${
                categoryKey === key ? "active" : ""
              }`}
              onClick={() => changeCategory(key)}
            >
              {value.label}
            </button>
          ))}
        </div>

        <section className="pronunciationCard">
          <div className="pronunciationProgressHeader">
            <strong>
              Věta {index + 1} z {category.items.length}
            </strong>
            <div className="pronunciationProgressTrack">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="pronunciationTarget">
            <span>Poslouchejte a zopakujte:</span>
            <h2>{item[0]}</h2>
            <p>{item[1]}</p>

            <div className="pronunciationListenButtons">
              <button type="button" onClick={() => speak(0.9)}>
                🔊 Přehrát normálně
              </button>
              <button type="button" onClick={() => speak(0.65)}>
                🐢 Přehrát pomalu
              </button>
            </div>

            <div className="pronunciationTip">
              <strong>💡 Tip:</strong> {item[2]}
            </div>
          </div>

          {liveText && (
            <div className="pronunciationLiveTranscript">
              Rozpoznávám: <strong>{liveText}</strong>
            </div>
          )}

          {result && (
            <div className={`pronunciationResult ${result.className}`}>
              <div className="pronunciationScoreCircle">
                <span>{result.emoji}</span>
                <strong>{result.score}%</strong>
              </div>
              <div>
                <h3>{result.title}</h3>
                <p>
                  {result.score >= 75
                    ? "Věta byla dobře srozumitelná."
                    : "Poslechněte si vzor a zkuste větu vyslovit pomaleji."}
                </p>
                <div className="pronunciationComparison">
                  <div>
                    <span>Vzorová věta</span>
                    <strong>{item[0]}</strong>
                  </div>
                  <div>
                    <span>Prohlížeč rozpoznal</span>
                    <strong>{result.spoken}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <div className="pronunciationError">⚠️ {error}</div>}

          <div className="pronunciationControls">
            {!isListening ? (
              <button
                type="button"
                className="pronunciationRecordButton"
                onClick={startListening}
              >
                🎤 Spustit nahrávání
              </button>
            ) : (
              <button
                type="button"
                className="pronunciationStopButton"
                onClick={() => recognitionRef.current?.stop()}
              >
                ● Zastavit nahrávání
              </button>
            )}
            <p>
              {isListening
                ? "Poslouchám… vyslovte celou větu."
                : "Funkce používá mikrofon a rozpoznávání řeči v prohlížeči."}
            </p>
          </div>

          <div className="pronunciationNavigation">
            <button type="button" onClick={() => move(-1)}>
              ← Předchozí
            </button>
            <button type="button" className="primary" onClick={() => move(1)}>
              Další věta →
            </button>
          </div>
        </section>

        <section className="pronunciationStats">
          <div>
            <span>🎤</span>
            <strong>{stats.attempts}</strong>
            <p>Celkem pokusů</p>
          </div>
          <div>
            <span>🏆</span>
            <strong>{stats.best}%</strong>
            <p>Nejlepší výsledek</p>
          </div>
          <div>
            <span>✅</span>
            <strong>{stats.successful}</strong>
            <p>Úspěšných pokusů</p>
          </div>
        </section>

        <section className="pronunciationNotice">
          <h2>Jak se výsledek počítá?</h2>
          <p>
            Prohlížeč převede řeč na text a aplikace jej porovná se vzorovou
            větou. Jde o hodnocení srozumitelnosti, nikoliv o přesnou fonetickou
            analýzu jednotlivých hlásek.
          </p>
        </section>
      </section>
    </main>
  );
}
#!/usr/bin/env python3
"""Generate Bali investment presentation PDF."""
from weasyprint import HTML
import os

FD = '/tmp/inter_fonts/extras/ttf'
OUT = '/home/user/Coe/public/bali_presentation.pdf'

GOLD = '#C8A144'
WHITE = '#FFFFFF'
GRAY = 'rgba(255,255,255,0.55)'
DIM  = 'rgba(255,255,255,0.25)'

# ── helpers ──────────────────────────────────────────────────────────────────

def ey(text, color=GOLD):
    return f'<div style="font-size:11px;font-weight:700;color:{color};letter-spacing:5px;text-transform:uppercase;margin-bottom:40px;">{text}</div>'

def h(text, size=100, color=WHITE, gap=-3):
    return f'<div style="font-size:{size}px;font-weight:900;line-height:.88;color:{color};text-transform:uppercase;letter-spacing:{gap}px;margin-bottom:0;">{text}</div>'

def body(text, size=22, color=GRAY, mt=36):
    return f'<div style="font-size:{size}px;font-weight:400;line-height:1.65;color:{color};max-width:420px;margin-top:{mt}px;">{text}</div>'

def divider(mt=36, mb=40, w='100%', thick=1, color='rgba(200,161,68,0.3)'):
    return f'<div style="width:{w};height:{thick}px;background:{color};margin-top:{mt}px;margin-bottom:{mb}px;"></div>'

def brand():
    return f'''
    <div style="position:absolute;bottom:30px;left:52px;right:52px;
                border-top:1px solid rgba(200,161,68,0.2);padding-top:18px;
                display:flex;align-items:center;gap:14px;">
      <span style="font-size:22px;color:{GOLD};">⬢</span>
      <span style="font-size:10px;font-weight:700;color:rgba(200,161,68,0.6);
                   letter-spacing:5px;text-transform:uppercase;">Seven Sky Villas</span>
    </div>'''

def ghost(num, color='rgba(255,255,255,0.03)'):
    return f'<div style="position:absolute;top:-10px;right:-20px;font-size:420px;font-weight:900;color:{color};line-height:1;letter-spacing:-16px;pointer-events:none;user-select:none;">{num}</div>'

def stat_bar(label, val, pct, mt=24):
    return f'''
    <div style="margin-top:{mt}px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
        <span style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:3px;text-transform:uppercase;">{label}</span>
        <span style="font-size:30px;font-weight:900;color:{WHITE};letter-spacing:-1px;">{val}</span>
      </div>
      <div style="width:100%;height:3px;background:rgba(255,255,255,0.08);">
        <div style="width:{pct}%;height:3px;background:{GOLD};"></div>
      </div>
    </div>'''

def box2(l_label, l_num, l_desc, r_label, r_num, r_desc, mt=32):
    return f'''
    <div style="display:flex;gap:0;border:1px solid rgba(255,255,255,0.08);margin-top:{mt}px;">
      <div style="flex:1;padding:32px 36px;border-right:1px solid rgba(255,255,255,0.08);">
        <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:4px;text-transform:uppercase;margin-bottom:12px;">{l_label}</div>
        <div style="font-size:72px;font-weight:900;color:{WHITE};line-height:1;letter-spacing:-3px;margin-bottom:10px;">{l_num}</div>
        <div style="font-size:17px;color:rgba(255,255,255,0.45);line-height:1.45;">{l_desc}</div>
      </div>
      <div style="flex:1;padding:32px 36px;background:rgba(200,161,68,0.06);">
        <div style="font-size:11px;font-weight:700;color:rgba(200,161,68,0.5);letter-spacing:4px;text-transform:uppercase;margin-bottom:12px;">{r_label}</div>
        <div style="font-size:72px;font-weight:900;color:{GOLD};line-height:1;letter-spacing:-3px;margin-bottom:10px;">{r_num}</div>
        <div style="font-size:17px;color:rgba(255,255,255,0.55);line-height:1.45;">{r_desc}</div>
      </div>
    </div>'''

def step3(items, mt=32):
    """items = [(num, title, desc), ...]"""
    rows = ''
    for n, t, d in items:
        rows += f'''
        <div style="display:flex;align-items:stretch;border-bottom:1px solid rgba(255,255,255,0.06);">
          <div style="font-size:52px;font-weight:900;color:rgba(255,255,255,0.06);
                      width:72px;flex-shrink:0;padding:14px 0;line-height:1;
                      display:flex;align-items:center;">{n}</div>
          <div style="padding:16px 0 16px 28px;border-left:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:22px;font-weight:700;color:{WHITE};text-transform:uppercase;
                        letter-spacing:.5px;margin-bottom:4px;">{t}</div>
            <div style="font-size:17px;color:rgba(255,255,255,0.4);line-height:1.4;">{d}</div>
          </div>
        </div>'''
    return f'<div style="border-top:1px solid rgba(255,255,255,0.06);margin-top:{mt}px;">{rows}</div>'

def page(bg, content, show_brand=True):
    br = brand() if show_brand else ''
    return f'<div class="page" style="background:{bg};">{ghost("")}{content}{br}</div>\n'

# ── CSS ───────────────────────────────────────────────────────────────────────

CSS = f"""
@font-face {{
  font-family:'Inter';
  src:url('file://{FD}/Inter-Regular.ttf');
  font-weight:400;font-style:normal;
}}
@font-face {{
  font-family:'Inter';
  src:url('file://{FD}/Inter-Bold.ttf');
  font-weight:700;font-style:normal;
}}
@font-face {{
  font-family:'Inter';
  src:url('file://{FD}/Inter-ExtraBold.ttf');
  font-weight:800;font-style:normal;
}}
@font-face {{
  font-family:'Inter';
  src:url('file://{FD}/Inter-Black.ttf');
  font-weight:900;font-style:normal;
}}
@page {{size:210mm 297mm;margin:0;}}
*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#000;}}
.page{{
  width:210mm;height:297mm;
  page-break-after:always;break-after:page;
  position:relative;overflow:hidden;
  font-family:'Inter','Liberation Sans',Arial,sans-serif;
  color:#fff;
}}
.page:last-child{{page-break-after:avoid;break-after:avoid;}}
.pad{{padding:52px 52px 100px;display:flex;flex-direction:column;justify-content:center;height:100%;}}
.pad-top{{padding:52px;display:flex;flex-direction:column;justify-content:flex-start;height:100%;}}
"""

# ── SLIDES ────────────────────────────────────────────────────────────────────

pages = []

# 01 · COVER
pages.append(page('#000000', f'''
{ghost("S", 'rgba(200,161,68,0.03)')}
<div class="pad">
  {ey("Видео-серия · Инвестиции в недвижимость", DIM)}
  <div style="margin-top:16px;">
    {h("БАЛИ.", 128, GOLD, -5)}
    {h("НЕДВИЖИМОСТЬ.", 76, WHITE, -3)}
    {h("ЧЕСТНО.", 76, WHITE, -3)}
  </div>
  {divider(56, 40, '64px', 2, GOLD)}
  {body("Александр Дормидонов · Застройщик · 6+ лет на рынке Бали", 18, DIM, 0)}
</div>
'''))

# 02 · ХУК
pages.append(page('linear-gradient(160deg,#000 0%,#0A1520 100%)', f'''
<div class="pad">
  {ey("01 · Хук", DIM)}
  {h("ПОЧЕМУ ОДНА", 72, WHITE, -2)}
  {h("ВИЛЛА", 72, WHITE, -2)}
  <div style="margin-top:8px;">
    {h("$1 000 000", 96, GOLD, -4)}
  </div>
  {h("А ДРУГАЯ —", 72, WHITE, -2)}
  <div style="margin-top:8px;">
    {h("$50 000?", 96, 'rgba(255,255,255,0.3)', -4)}
  </div>
  {divider(36, 0)}
  {body("На фото они одинаковые: бассейн, пальмы, закат.", 20, GRAY, 32)}
</div>
'''))

# 03 · ЧЕРЕЗ ГОД
pages.append(page('#000000', f'''
<div class="pad">
  {ey("02 · Разница", DIM)}
  <div style="margin-bottom:24px;">
    {h("ТОЛЬКО ОДНА", 60, WHITE, -2)}
  </div>
  <div style="display:flex;gap:0;border:1px solid rgba(200,161,68,0.15);margin-top:8px;">
    <div style="flex:1;padding:32px 32px;border-right:1px solid rgba(200,161,68,0.15);">
      <div style="font-size:11px;font-weight:700;color:rgba(200,161,68,0.5);letter-spacing:4px;text-transform:uppercase;margin-bottom:14px;">ЧЕРЕЗ ГОД СТОИТ</div>
      <div style="font-size:64px;font-weight:900;color:{GOLD};line-height:1;letter-spacing:-3px;margin-bottom:8px;">$1.5M</div>
      <div style="font-size:16px;color:rgba(255,255,255,0.5);">Ликвидный актив.<br>Растёт в цене.</div>
    </div>
    <div style="flex:1;padding:32px 32px;">
      <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.25);letter-spacing:4px;text-transform:uppercase;margin-bottom:14px;">ВТОРАЯ — ЭТО</div>
      <div style="font-size:64px;font-weight:900;color:rgba(255,255,255,0.2);line-height:1;letter-spacing:-3px;margin-bottom:8px;">ХЛАМ</div>
      <div style="font-size:16px;color:rgba(255,255,255,0.35);">Дорогой металлолом,<br>который не продать.</div>
    </div>
  </div>
  {body("Разница не в цене. В подходе к строительству.", 20, GRAY, 32)}
</div>
'''))

# 04 · ГЛАВНЫЙ РИСК
pages.append(page('#000000', f'''
{ghost("!", 'rgba(255,255,255,0.02)')}
<div class="pad">
  {ey("04 · Главный риск", DIM)}
  {body("Самый большой риск —", 26, 'rgba(255,255,255,0.4)', 0)}
  {h("НЕ ОБЪЕКТ.", 90, WHITE, -3)}
  {divider(28, 28, '100%', 1, 'rgba(255,255,255,0.06)')}
  {body("Самый большой риск —", 26, 'rgba(255,255,255,0.4)', 0)}
  {h("НЕПРАВИЛЬНЫЙ", 72, GOLD, -2)}
  {h("ПРОВОДНИК.", 72, WHITE, -2)}
  {divider(36, 0)}
  {body("С кем ты идёшь в сделку — это решает всё.", 20, GRAY, 28)}
</div>
'''))

# 05 · КТО Я
pages.append(page('linear-gradient(160deg,#000 0%,#0D0D12 100%)', f'''
<div class="pad">
  {ey("05 · Застройщик", DIM)}
  {h("АЛЕКСАНДР", 80, WHITE, -2)}
  {h("ДОРМИДОНОВ", 80, GOLD, -2)}
  {divider(36, 32, '64px', 2, GOLD)}
  {body("Более 6 лет на рынке Бали — не как эксперт, а как застройщик. Знаю, кто как строит, кто из чего, кто достроит — а кто нет.", 20, GRAY, 0)}
  <div style="display:flex;gap:1px;border:1px solid rgba(255,255,255,0.08);margin-top:40px;">
    <div style="flex:1;padding:24px 28px;border-right:1px solid rgba(255,255,255,0.08);">
      <div style="font-size:48px;font-weight:900;color:{GOLD};line-height:1;letter-spacing:-2px;">6+</div>
      <div style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:3px;text-transform:uppercase;margin-top:6px;">Лет на рынке</div>
    </div>
    <div style="flex:1;padding:24px 28px;border-right:1px solid rgba(255,255,255,0.08);">
      <div style="font-size:48px;font-weight:900;color:{WHITE};line-height:1;letter-spacing:-2px;">40+</div>
      <div style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:3px;text-transform:uppercase;margin-top:6px;">Вилл построено</div>
    </div>
    <div style="flex:1;padding:24px 28px;">
      <div style="font-size:48px;font-weight:900;color:{WHITE};line-height:1;letter-spacing:-2px;">Топ</div>
      <div style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:3px;text-transform:uppercase;margin-top:6px;">Эксперт Бали</div>
    </div>
  </div>
</div>
'''))

# 06 · ИСТОРИЯ / ЦИФРЫ
pages.append(page('#000000', f'''
<div class="pad">
  {ey("06 · Сочи vs Бали · Цифры", DIM)}
  {h("ПРОДУКТИВНОСТЬ,", 64, WHITE, -2)}
  {h("А НЕ ПЛОЩАДЬ.", 64, GOLD, -2)}
  {divider(36, 0)}
  {stat_bar("Сочи · 40 вилл · 7 500 м²", "700 ₽/м²", 35, 32)}
  {stat_bar("Бали · 26 вилл · 3 500 м²", "2 000 ₽/м²", 100, 28)}
  {divider(32, 0)}
  {body("Площадь в 2 раза меньше — доход в 3 раза больше. Вся разница в инвестиционном подходе.", 19, GRAY, 28)}
</div>
'''))

# 07 · СДВИГ УБЕЖДЕНИЯ
pages.append(page('linear-gradient(180deg,#000 0%,#0A0A00 100%)', f'''
{ghost("?", 'rgba(200,161,68,0.02)')}
<div class="pad">
  {ey("07 · Сдвиг убеждения", DIM)}
  <div style="border-left:3px solid {GOLD};padding-left:36px;margin-top:16px;">
    {h("«НА БАЛИ МОЖНО", 60, WHITE, -1)}
    {h("КУПИТЬ ВИЛЛУ", 60, WHITE, -1)}
    {h("ЗА КОПЕЙКИ»", 60, GOLD, -1)}
  </div>
  {divider(40, 0)}
  {body("Поставь себя на место продавца. Если тебе обещают $3 000 в месяц на 5 лет — как он это выполнит?", 20, GRAY, 28)}
  {body("Рубль на дереве не растёт.", 24, WHITE, 20)}
</div>
'''))

# 08 · СЕКРЕТ №1 SECTION
pages.append(page('#000000', f'''
{ghost("01", 'rgba(200,161,68,0.04)')}
<div class="pad-top" style="padding-top:80px;">
  {ey("Секрет первый", DIM)}
  <div style="margin-top:16px;">
    {h("ПРАВИЛО", 100, WHITE, -3)}
    {h("ГОСТИНИЧНОГО", 72, WHITE, -2)}
    {h("НОМЕРА", 100, GOLD, -3)}
  </div>
  {divider(48, 0)}
  {body("Без этого правила любая вилла превращается в стройку для души, а не в актив.", 20, GRAY, 28)}
</div>
'''))

# 09 · $100 VS $500
pages.append(page('linear-gradient(160deg,#000 0%,#0A1000 100%)', f'''
<div class="pad">
  {ey("09 · Секрет № 1 · Цифры", DIM)}
  {h("РАЗНИЦА В 5 РАЗ.", 72, WHITE, -2)}
  {body("За счёт подхода — а не площади. На фото они одинаковые.", 20, GRAY, 16)}
  {box2(
    "Частный сектор · без инфраструктуры",
    "$100", "в сутки. Без управляющей компании, нет стандарта.",
    "Отельный стандарт · с инфраструктурой",
    "$500", "в сутки. Высокая заполняемость. Стабильный доход.",
    40
  )}
  {divider(32, 0)}
  {body("Одна приносит деньги. Другая — нет. Невооружённым глазом не отличишь.", 19, GRAY, 24)}
</div>
'''))

# 10 · МИКРОИНСТРУМЕНТ КАРТА
pages.append(page('#000000', f'''
<div class="pad">
  {ey("10 · Микроинструмент", DIM)}
  {h("ОТКРОЙ КАРТУ.", 80, WHITE, -2)}
  {h("5 МИНУТ.", 80, GOLD, -2)}
  {divider(36, 0)}
  {body("Что в радиусе 5 минут пешком от объекта?", 22, WHITE, 28)}
  <div style="display:flex;gap:0;border:1px solid rgba(255,255,255,0.08);margin-top:28px;">
    <div style="flex:1;padding:28px 32px;border-right:1px solid rgba(255,255,255,0.08);">
      <div style="font-size:11px;font-weight:700;color:rgba(255,100,100,0.7);letter-spacing:4px;text-transform:uppercase;margin-bottom:12px;">Плохо</div>
      <div style="font-size:18px;color:rgba(255,255,255,0.5);line-height:1.5;">Петухи. Жилые дома. Частный сектор. Нет инфраструктуры.</div>
    </div>
    <div style="flex:1;padding:28px 32px;background:rgba(200,161,68,0.05);">
      <div style="font-size:11px;font-weight:700;color:rgba(200,161,68,0.6);letter-spacing:4px;text-transform:uppercase;margin-bottom:12px;">Хорошо</div>
      <div style="font-size:18px;color:rgba(255,255,255,0.6);line-height:1.5;">Кафе, рестораны, магазины. Гость хочет сюда вернуться.</div>
    </div>
  </div>
</div>
'''))

# 11 · СЕКРЕТ №2 SECTION
pages.append(page('#000000', f'''
{ghost("02", 'rgba(200,161,68,0.04)')}
<div class="pad-top" style="padding-top:80px;">
  {ey("Секрет второй", DIM)}
  <div style="margin-top:16px;">
    {h("ЗЕМЛЯ,", 100, WHITE, -3)}
    {h("КОТОРУЮ НИКТО", 72, WHITE, -2)}
    {h("НЕ КУПИТ", 100, GOLD, -3)}
  </div>
  {divider(48, 0)}
  {body("Даже если объект красивый — неправильная земля убивает всю инвестицию.", 20, GRAY, 28)}
</div>
'''))

# 12 · КЕЙС АНДРЕ ФРЕЙ
pages.append(page('linear-gradient(160deg,#000 0%,#0A0800 100%)', f'''
{ghost("300", 'rgba(255,255,255,0.015)')}
<div class="pad">
  {ey("12 · Реальный кейс · Андре Фрей", DIM)}
  {h("300 ВИЛЛ", 96, WHITE, -3)}
  {h("НА СЕЛЬХОЗЗЕМЛЕ.", 60, GOLD, -2)}
  {divider(36, 0)}
  {body("Красивые, заманчивые, дёшево — но нелегальные.", 22, WHITE, 0)}
  {step3([
    ("✕", "Продать нельзя", "Нельзя переоформить право собственности"),
    ("✕", "Сдавать нельзя", "Коммерческая деятельность на сельхозземле запрещена"),
    ("✕", "Переоформить нельзя", "Деньги вложены — виллы стоят мёртвым грузом"),
  ], 32)}
</div>
'''))

# 13 · СЕКРЕТ №3 SECTION
pages.append(page('#000000', f'''
{ghost("03", 'rgba(200,161,68,0.04)')}
<div class="pad-top" style="padding-top:80px;">
  {ey("Секрет третий", DIM)}
  <div style="margin-top:16px;">
    {h("СТРОЙКА", 100, WHITE, -3)}
    {h("БЕЗ", 100, WHITE, -3)}
    {h("КОНЦА", 100, GOLD, -3)}
  </div>
  {divider(48, 0)}
  {body("Правильная земля — это фундамент. Но она не гарантирует, что стройка пойдёт гладко.", 20, GRAY, 28)}
</div>
'''))

# 14 · КЕЙС ДОМОГАЦКИЙ
pages.append(page('linear-gradient(180deg,#000 0%,#0F0000 100%)', f'''
{ghost("150", 'rgba(255,0,0,0.02)')}
<div class="pad">
  {ey("14 · Реальный кейс · 80 инвесторов", DIM)}
  {h("150 МЛН ₽", 96, GOLD, -3)}
  {h("УЩЕРБ.", 96, WHITE, -3)}
  {divider(36, 0)}
  {body("Гузеева, Собчак, Лолита рекламировали застройщика Домогацкого. Виллы за $200K с видом на океан. 80 человек вложились.", 20, GRAY, 0)}
  {body("Стройка встала. Домогацкий сбежал с Бали.", 22, WHITE, 24)}
  {body("Это не история про мошенника. Это история про то, что никто не прошёл три сита Честного отбора.", 18, 'rgba(255,255,255,0.35)', 20)}
</div>
'''))

# 15 · ТРИ СИТА
pages.append(page('linear-gradient(160deg,#000 0%,#0A0A00 100%)', f'''
<div class="pad">
  {ey("15 · Честный отбор · Система", DIM)}
  {h("ТРИ СИТА.", 80, WHITE, -2)}
  {step3([
    ("01", "Готов учиться", "На чужих ошибках — а не на своих деньгах"),
    ("02", "Готов платить", "За качественный актив — без поиска халявы"),
    ("03", "Готов управлять", "Стройкой как процессом — или выбрать надёжного подрядчика"),
  ], 32)}
  {divider(32, 0)}
  {body("Каждое сито отсекает тех, кто потеряет деньги на Бали.", 19, GRAY, 24)}
</div>
'''))

# 16 · ДВА ТИПА
pages.append(page('#000000', f'''
<div class="pad">
  {ey("16 · Синтез · Два типа покупателей", DIM)}
  <div style="display:flex;gap:0;border:1px solid rgba(255,255,255,0.06);margin-top:24px;">
    <div style="flex:1;padding:32px 32px;border-right:1px solid rgba(255,255,255,0.06);
                border-top:3px solid rgba(255,80,80,0.6);">
      <div style="font-size:11px;font-weight:700;color:rgba(255,80,80,0.6);letter-spacing:4px;text-transform:uppercase;margin-bottom:16px;">Тип первый</div>
      <div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:12px;line-height:1.1;">Выбор по эмоции и картинке</div>
      <div style="font-size:16px;color:rgba(255,255,255,0.4);line-height:1.5;">Не прошёл ни одного сита. Итог — потеря денег или недострой.</div>
    </div>
    <div style="flex:1;padding:32px 32px;background:rgba(200,161,68,0.04);
                border-top:3px solid {GOLD};">
      <div style="font-size:11px;font-weight:700;color:rgba(200,161,68,0.6);letter-spacing:4px;text-transform:uppercase;margin-bottom:16px;">Тип второй</div>
      <div style="font-size:22px;font-weight:700;color:{GOLD};margin-bottom:12px;line-height:1.1;">Три вопроса до подписания</div>
      <div style="font-size:16px;color:rgba(255,255,255,0.55);line-height:1.5;">Прошёл три сита. Итог — доходный ликвидный актив в долларах.</div>
    </div>
  </div>
  {divider(32, 0)}
  {body("Разница не в деньгах. Разница в трёх вопросах до подписания.", 22, WHITE, 24)}
  {step3([
    ("01", "Назначение земли?", "Коммерческое или сельхоз?"),
    ("02", "Кто управляет?", "Фактический доход — не на бумаге"),
    ("03", "Что построил до этого?", "Реальные объекты — не рендеры"),
  ], 24)}
</div>
'''))

# 17 · ОФФЕР
pages.append(page('linear-gradient(180deg,#000 0%,#0A0800 100%)', f'''
<div class="pad">
  {ey("17 · Оффер", DIM)}
  {h("ПРОСТО СОЗВОН", 72, WHITE, -2)}
  {h("НА ЗУМЕ.", 72, GOLD, -2)}
  {divider(36, 0)}
  {body("Никакой продажи. Никакого давления. Разберём твою ситуацию и покажем, какой объект тебе подходит.", 20, GRAY, 0)}
  <div style="margin-top:36px;border:1px solid rgba(200,161,68,0.3);padding:32px 36px;">
    <div style="font-size:11px;font-weight:700;color:rgba(200,161,68,0.5);letter-spacing:4px;text-transform:uppercase;margin-bottom:20px;">Бонус при записи</div>
    <div style="font-size:26px;font-weight:800;color:#fff;line-height:1.2;margin-bottom:12px;">Получасовой видеообзор<br>виллы — бесплатно</div>
    <div style="font-size:16px;color:rgba(255,255,255,0.4);">Каждый угол, каждый метр, каждая деталь — до созвона.</div>
  </div>
</div>
'''))

# 18 · ФИНАЛ
pages.append(page('#000000', f'''
{ghost("∞", 'rgba(200,161,68,0.03)')}
<div style="padding:52px;display:flex;flex-direction:column;justify-content:space-between;height:100%;">
  <div>
    {ey("Честный отбор · sevensky-bali.com", DIM)}
  </div>
  <div>
    {h("ВТОРОЙ", 96, WHITE, -3)}
    {h("СЦЕНАРИЙ", 96, WHITE, -3)}
    {h("ТВОЕЙ ЖИЗНИ.", 72, GOLD, -2)}
  </div>
  <div>
    {divider(0, 20)}
    {body("Недвижимость на Бали — это не про бетон. Три сита. Правильный объект. Стабильный доход в долларах.", 18, GRAY, 0)}
    <div style="margin-top:28px;font-size:10px;font-weight:700;color:rgba(200,161,68,0.4);letter-spacing:5px;text-transform:uppercase;">⬢ Seven Sky Villas · Александр Дормидонов · Застройщик</div>
  </div>
</div>
'''))

# ── BUILD HTML ────────────────────────────────────────────────────────────────

HTML_DOC = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<style>{CSS}</style>
</head>
<body>
{''.join(pages)}
</body>
</html>"""

with open('/tmp/pres.html', 'w', encoding='utf-8') as f:
    f.write(HTML_DOC)

print("Generating PDF…")
HTML(filename='/tmp/pres.html', base_url='/').write_pdf(OUT)
size = os.path.getsize(OUT)
print(f"✓  PDF saved → {OUT}  ({size/1024:.0f} KB,  {len(pages)} pages)")

"""Generate editable SVG UML diagrams for the project review.

Run from the project root: python3 review/diagrams/generate.py
The SVG files can be rasterized with ImageMagick's `convert` command.
"""

from pathlib import Path
from xml.sax.saxutils import escape


OUT = Path(__file__).resolve().parent
INK = "#18304b"
ACCENT = "#1469a8"
PALE = "#e8f3fb"
LIGHT = "#f5f9fc"
MUTED = "#536779"


def svg_start(width, height, title):
    return [f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
<defs><marker id="arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0 0 L10 4 L0 8 Z" fill="{INK}"/></marker></defs>
<rect width="100%" height="100%" fill="white"/>
<style>text{{font-family:DejaVu Sans,Arial,sans-serif;fill:{INK}}}.title{{font-size:30px;font-weight:700}}.head{{font-size:19px;font-weight:700}}.body{{font-size:16px}}.small{{font-size:14px;fill:{MUTED}}}.label{{font-size:15px;fill:{ACCENT};font-weight:600}}</style>
<text x="48" y="55" class="title">{escape(title)}</text>''']


def rect(parts, x, y, w, h, fill=LIGHT, rx=10, stroke=INK, sw=2):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')


def line(parts, x1, y1, x2, y2, arrow=False, dashed=False, color=INK, sw=2):
    marker = ' marker-end="url(#arrow)"' if arrow else ''
    dash = ' stroke-dasharray="7 6"' if dashed else ''
    parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{sw}"{marker}{dash}/>')


def poly(parts, points, arrow=False, dashed=False, color=INK):
    p = ' '.join(f'{x},{y}' for x, y in points)
    marker = ' marker-end="url(#arrow)"' if arrow else ''
    dash = ' stroke-dasharray="7 6"' if dashed else ''
    parts.append(f'<polyline points="{p}" fill="none" stroke="{color}" stroke-width="2"{marker}{dash}/>')


def text(parts, x, y, value, kind='body', anchor='start'):
    parts.append(f'<text x="{x}" y="{y}" text-anchor="{anchor}" class="{kind}">{escape(value)}</text>')


def uml_box(parts, x, y, w, h, name, stereotype, attributes, operations):
    rect(parts, x, y, w, h, 'white', 4)
    rect(parts, x, y, w, 76, PALE, 4, PALE, 0)
    text(parts, x + w/2, y + 28, stereotype, 'small', 'middle')
    text(parts, x + w/2, y + 55, name, 'head', 'middle')
    line(parts, x, y + 76, x + w, y + 76)
    yy = y + 105
    for item in attributes:
        text(parts, x + 18, yy, item)
        yy += 29
    if operations:
        line(parts, x, yy - 12, x + w, yy - 12)
        yy += 13
        for item in operations:
            text(parts, x + 18, yy, item)
            yy += 28


def save(name, parts):
    parts.append('</svg>')
    (OUT / name).write_text('\n'.join(parts) + '\n', encoding='utf-8')


def class_diagram():
    p = svg_start(1520, 790, 'Class diagram · shared backend state')
    uml_box(p, 65, 160, 270, 225, 'ReactClient', '«browser UI»',
            ['- selectedProblem', '- editorCode'], ['+ requestProblems()', '+ submitCode()'])
    uml_box(p, 490, 155, 335, 230, 'ApiHandler', '«HTTP controller»',
            ['+ GET /api/problems', '+ POST /api/run'],
            ['+ POST /api/submissions', '+ POST /api/problems'])
    uml_box(p, 1010, 125, 435, 295, 'ProblemStore', '«module-scoped singleton-like»',
            ['- problems: Problem array', '- nextId: number'],
            ['+ list / find problem', '+ add custom problem', '+ mark accepted problem solved'])
    uml_box(p, 1010, 530, 435, 200, 'SubmissionRepository', '«module service»',
            ['- database: DatabaseSync'], ['+ saveSubmission()', '+ listSubmissions()'])
    uml_box(p, 490, 535, 335, 145, 'SQLite database', '«persistent storage»',
            ['- submissions table'], [])
    line(p, 335, 250, 490, 250, True)
    text(p, 412, 235, 'HTTP', 'label', 'middle')
    line(p, 825, 255, 1010, 255, True)
    text(p, 918, 238, 'reads / updates', 'label', 'middle')
    poly(p, [(825, 350), (916, 350), (916, 610), (1010, 610)], True)
    text(p, 925, 482, 'uses', 'label')
    line(p, 1010, 645, 825, 645, True)
    text(p, 918, 672, 'SQL', 'label', 'middle')
    text(p, 65, 751, 'Conceptual UML: ProblemStore describes the state object in api.mjs; repository describes submissions.mjs.', 'small')
    save('class-diagram.svg', p)


def action(p, x, y, w, h, lines):
    rect(p, x, y, w, h, PALE, 18)
    middle = y + h/2 + 6
    if isinstance(lines, str):
        lines = [lines]
    for i, label in enumerate(lines):
        text(p, x + w/2, middle + (i - (len(lines)-1)/2)*24, label, 'body', 'middle')


def diamond(p, cx, cy, rx, ry, label):
    pts = f'{cx},{cy-ry} {cx+rx},{cy} {cx},{cy+ry} {cx-rx},{cy}'
    p.append(f'<polygon points="{pts}" fill="white" stroke="{INK}" stroke-width="2"/>')
    text(p, cx, cy+5, label, 'body', 'middle')


def activity_diagram():
    p = svg_start(1350, 1280, 'Activity diagram · practice and submit')
    p.append(f'<circle cx="675" cy="111" r="16" fill="{INK}"/>')
    action(p, 520, 155, 310, 64, 'Load problem catalogue')
    action(p, 520, 265, 310, 64, 'Select a problem')
    action(p, 520, 375, 310, 64, 'Write or edit solution')
    diamond(p, 675, 520, 115, 58, 'Run sample?')
    action(p, 145, 620, 325, 72, ['Apply heuristic check', '(no code execution)'])
    action(p, 145, 755, 325, 65, 'Show simulated feedback')
    action(p, 865, 625, 330, 72, ['Submit solution', 'and check code shape'])
    action(p, 865, 755, 330, 65, 'Save submission in SQLite')
    diamond(p, 1030, 905, 110, 56, 'Accepted?')
    action(p, 445, 1005, 340, 66, 'Mark problem solved in store')
    action(p, 890, 1005, 280, 66, 'Keep current solved flag')
    line(p, 675, 127, 675, 155, True)
    line(p, 675, 219, 675, 265, True)
    line(p, 675, 329, 675, 375, True)
    line(p, 675, 439, 675, 462, True)
    poly(p, [(560, 520), (308, 520), (308, 620)], True)
    text(p, 428, 504, 'yes', 'label', 'middle')
    poly(p, [(790, 520), (1030, 520), (1030, 625)], True)
    text(p, 901, 504, 'no / ready to submit', 'label', 'middle')
    line(p, 308, 692, 308, 755, True)
    poly(p, [(145, 788), (83, 788), (83, 406), (520, 406)], True)
    text(p, 91, 585, 'revise or continue', 'label')
    line(p, 1030, 697, 1030, 755, True)
    line(p, 1030, 820, 1030, 849, True)
    poly(p, [(920, 905), (615, 905), (615, 1005)], True)
    text(p, 776, 888, 'yes', 'label', 'middle')
    line(p, 1030, 961, 1030, 1005, True)
    text(p, 1050, 988, 'no', 'label')
    line(p, 615, 1071, 615, 1120)
    line(p, 1030, 1071, 1030, 1120)
    line(p, 615, 1120, 1030, 1120)
    line(p, 823, 1120, 823, 1175, True)
    p.append(f'<circle cx="823" cy="1195" r="19" fill="white" stroke="{INK}" stroke-width="2"/>')
    p.append(f'<circle cx="823" cy="1195" r="12" fill="{INK}"/>')
    text(p, 675, 1250, 'Response shown; student may view history or try another problem.', 'small', 'middle')
    save('activity-diagram.svg', p)


def message(p, y, from_x, to_x, label, dashed=False):
    offset = 15 if from_x < to_x else -15
    line(p, from_x, y, to_x - offset, y, True, dashed)
    text(p, (from_x + to_x)/2, y-10, label, 'body', 'middle')


def frame(p, x, y, w, h, title):
    rect(p, x, y, w, h, 'none', 0, MUTED, 1.5)
    rect(p, x, y, 90, 28, PALE, 0, MUTED, 1)
    text(p, x+45, y+20, title, 'label', 'middle')


def sequence_diagram():
    p = svg_start(1630, 1490, 'Sequence diagram · student practice session')
    xs = [120, 430, 760, 1080, 1430]
    names = ['Student', 'React UI', 'API handler', 'Problem store', 'SQLite repository']
    for x, name in zip(xs, names):
        rect(p, x-115, 95, 230, 56, PALE, 5)
        text(p, x, 130, name, 'head', 'middle')
        line(p, x, 151, x, 1430, dashed=True, color=MUTED, sw=1.5)
    message(p, 205, xs[0], xs[1], 'Open practice page')
    message(p, 250, xs[1], xs[2], 'GET /api/problems')
    message(p, 295, xs[2], xs[3], 'Read shared problems')
    message(p, 340, xs[3], xs[2], 'Problem list', True)
    message(p, 385, xs[2], xs[1], '200 + problem list', True)
    message(p, 430, xs[1], xs[0], 'Show catalogue and editor', True)
    frame(p, 35, 465, 1555, 205, 'opt  Run sample')
    message(p, 515, xs[0], xs[1], 'Click Run')
    message(p, 560, xs[1], xs[2], 'POST /api/run (heuristic)')
    message(p, 605, xs[2], xs[3], 'Check problem ID')
    message(p, 650, xs[2], xs[1], 'Simulated feedback', True)
    frame(p, 35, 695, 1555, 280, 'opt  Submit solution')
    message(p, 735, xs[0], xs[1], 'Click Submit')
    message(p, 775, xs[1], xs[2], 'POST /api/submissions')
    message(p, 815, xs[2], xs[3], 'Validate problem ID')
    message(p, 855, xs[2], xs[4], 'saveSubmission(...)')
    message(p, 895, xs[4], xs[2], 'Saved record', True)
    message(p, 935, xs[2], xs[3], '[accepted] set solved = true')
    message(p, 975, xs[2], xs[1], '201 + status and metadata', True)
    frame(p, 35, 1000, 1555, 190, 'opt  View history')
    message(p, 1040, xs[1], xs[2], 'GET /api/submissions?problemId=...')
    message(p, 1080, xs[2], xs[4], 'listSubmissions(problemId)')
    message(p, 1120, xs[4], xs[2], 'Submission metadata', True)
    message(p, 1160, xs[2], xs[1], '200 + submission history', True)
    frame(p, 35, 1215, 1555, 190, 'opt  Create problem')
    message(p, 1255, xs[0], xs[1], 'Add custom problem')
    message(p, 1295, xs[1], xs[2], 'POST /api/problems')
    message(p, 1335, xs[2], xs[3], 'Assign nextId; add to shared list')
    message(p, 1375, xs[3], xs[2], 'New problem', True)
    message(p, 1415, xs[2], xs[1], '201 + new problem', True)
    save('sequence-diagram.svg', p)


if __name__ == '__main__':
    class_diagram()
    activity_diagram()
    sequence_diagram()

from flexx import flx
import random
import csv

data_array = [random.randint(0, 100) for i in range(100)]


class Fag(flx.PyComponent):

    def __init__(self):
        self.question_list = []

    # 根据运算符计算结果
    def cal(self, operator, op1, op2):
        if operator == '+':
            return op1 + op2
        elif operator == '-':
            return op1 - op2
        elif operator == '×':
            return op1 * op2
        elif operator == '÷' and op2 != 0:
            return op1 / op2

    #  判断运算是否符合要求
    def judge(self, operator, op1, op2):
        if operator == '+':
            tmp = op1 + op2
            if tmp > 100 or op1 == 0 or op2 == 0:  # 加法结果不能大于100
                return 0
        elif operator == '-':  # 减法结果不能为负数
            tmp = op1 - op2
            if tmp < 0:
                return 0
        elif operator == '×':  # 乘法结果不能大于100
            tmp = op1 * op2
            if tmp > 100:
                return 0
        elif operator == '÷':  # 除法除数不能为0，结果不能大于100，两个数能整除
            if op2 == 0:
                return 0
            else:
                tmp = op1 / op2
                if op1 == 0 or op1 % op2 != 0 or tmp > 100:
                    return 0
        return 1

    # 随机生成表达式
    def generator(self):
        priority = {'+': 0, '-': 0, '×': 1, '÷': 1, '(': 2, ')': 2}  # 运算符优先级
        operator = {0: '+', 1: '-', 2: '×', 3: '÷'}
        expression = ''
        flag = False  # 表达式符合要求的标志
        while flag != True:
            # 产生三个运算数
            opnum1 = random.randint(1, 100)
            opnum2 = random.randint(1, 100)
            opnum3 = random.randint(1, 100)

            # 产生两个运算符
            ope1 = operator[random.randint(1, 100) % 4]
            ope2 = operator[random.randint(1, 100) % 4]

            # 表达式列表
            question = [opnum1, ope1, opnum2, ope2, opnum3]
            ans = 0
            tmp = 0

            # 根据两个运算符优先级不同的情况判断是否符合要求
            if priority[ope1] > priority[ope2] or priority[ope1] == priority[ope2]:
                if self.judge(ope1, opnum1, opnum2):
                    tmp = self.cal(ope1, opnum1, opnum2)
                else:
                    continue
                if self.judge(ope2, tmp, opnum3):
                    ans = self.cal(ope2, tmp, opnum3)
                    flag = True
                else:
                    continue
            elif priority[ope1] < priority[ope2]:
                if self.judge(ope2, opnum2, opnum3):
                    tmp = self.cal(ope2, opnum2, opnum3)
                else:
                    continue
                if self.judge(ope1, opnum1, tmp):
                    ans = self.cal(ope1, opnum1, tmp)
                    flag = True
                else:
                    continue

            # 加上括号
            if priority[ope1] > priority[ope2]:
                question.insert(0, '(')
                question.insert(4, ')')
            elif priority[ope1] < priority[ope2]:
                question.insert(2, '(')
                question.insert(6, ')')
            for i in range(len(question)):
                expression += str(question[i])
        return expression, ans

    # 随机产生num个表达式
    def train(self, num):
        questionList = ['' for i in range(num)]
        for i in range(num):
            tmp = []
            expression, ans = self.generator()
            tmp.append(expression + '=')
            tmp.append(ans)
            tmp.append('')
            questionList[i] = tmp
            self.question_list = questionList
        return questionList

    def export(self, question_list):
        path = r'd:/test.csv'
        if question_list == None:
            question_list = self.question_list
        with open(path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            for row in question_list:
                writer.writerow(row)


class MainWindow(flx.PyComponent):



    def init(self):
        self.fag = Fag()
        self.cnt = 0
        self.flag = 0
        self.ql = []
        self.num = 0
        # self.apply_style('overflow-y: scroll;')  # enable scrolling
        with flx.VBox() as self.vb1:
            with flx.HSplit() as self.hb1:
                self.lb1 = flx.Label(text='题目数量：')
                self.le1 = flx.LineEdit(placeholder_text='输入题目数量,不要超过1000')
                self.b1 = flx.Button(text='产生题目')
                self.b2 = flx.Button(text='导出题目')
                self.b3 = flx.Button(text='开始答题')
            with flx.HSplit() as self.hb2:
                self.lb2 = flx.Label(text='输入答案: ')
                self.le2 = flx.LineEdit(placeholder_text='输入你的答案')
                self.lb3 = flx.Label(text='提示框:')
                self.le3 = flx.LineEdit()

    @flx.reaction('b1.pointer_click')
    def showquestion(self, *events):
        # print(int(self.le1.text))
        if self.le1.text.isdigit():
            self.num = int(self.le1.text)
            self.ql = self.fag.train(int(self.le1.text))
            with self.vb1:
                for i, q in enumerate(self.ql):
                    flx.Label(parent=self.vb1, text='题目' + str(i + 1) + ':  ' + q[0])
        else:
            self.le3.set_text('题目数量必须为整数')

    @flx.reaction('b2.pointer_click')
    def exportquestion(self, *events):
        self.fag.export(self.ql)
        self.le3.set_text('导出成功,文件路径为d:/test.csv')

    @flx.reaction('b3.pointer_click')
    def startjudge(self, *events):
        self.le3.set_text('开始答题，在左边的输入框输入答案按回车')
        self.flag = 1

    @flx.reaction('le2.submit')
    def judgeall(self, *events):
        # self.lb3.set_text('你的答案是'+self.le2.text)
        if self.flag:
            if self.cnt < self.num:
                # print(self.cnt, ':', self.le2.text)
                if self.le2.text.isdigit():
                    if int(self.le2.text) == self.ql[self.cnt][1]:
                        self.le3.set_text('题目' + str(self.cnt + 1) + '回答正确')
                    else:
                        self.le3.set_text('题目' + str(self.cnt + 1) + '回答错误')
                    self.ql[self.cnt][2] = str('你的答案' + self.le2.text)
                    self.cnt += 1
                else:
                    self.le3.set_text('请输入整数答案')

            else:
                self.le3.set_text('答题结束,停止作答')
                self.flag = 0
        else:
            self.lb3.set_text('未开始答题')


class MainView(flx.PyComponent):

    def init(self):
        self.MW = MainWindow()


if __name__ == '__main__':
    app = flx.App(MainView)
    app.launch('browser')
    # app.export('example.html')
    flx.run()

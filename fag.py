import random
import csv


# 根据运算符计算结果
def cal(operator, op1, op2):
    if operator == '+':
        return op1 + op2
    elif operator == '-':
        return op1 - op2
    elif operator == '×':
        return op1 * op2
    elif operator == '÷' and op2 != 0:
        return op1 / op2


#  判断运算是否符合要求
def judge(operator, op1, op2):
    if operator == '+':
        tmp = op1 + op2
        if tmp > 100 or op1 == 0 or op2 == 0:   # 加法结果不能大于100
            return 0
    elif operator == '-':                       # 减法结果不能为负数
        tmp = op1 - op2
        if tmp < 0:
            return 0
    elif operator == '×':                       # 乘法结果不能大于100
        tmp = op1 * op2
        if tmp > 100:
            return 0
    elif operator == '÷':                       # 除法除数不能为0，结果不能大于100，两个数能整除
        if op2 == 0:
            return 0
        else:
            tmp = op1 / op2
            if op1 == 0 or op1 % op2 != 0 or tmp > 100:
                return 0
    return 1

# 随机生成表达式
def generator():
    priority = {'+': 0, '-': 0, '×': 1, '÷': 1, '(': 2, ')': 2}     # 运算符优先级
    operator = {0: '+', 1: '-', 2: '×', 3: '÷'}
    expression = ''
    flag = False        # 表达式符合要求的标志
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
            if judge(ope1, opnum1, opnum2):
                tmp = cal(ope1, opnum1, opnum2)
            else:
                continue
            if judge(ope2, tmp, opnum3):
                ans = cal(ope2, tmp, opnum3)
                flag = True
            else:
                continue
        elif priority[ope1] < priority[ope2]:
            if judge(ope2, opnum2, opnum3):
                tmp = cal(ope2, opnum2, opnum3)
            else:
                continue
            if judge(ope1, opnum1, tmp):
                ans = cal(ope1, opnum1, tmp)
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
def train(num):
    question_list = ['' for i in range(num)]
    for i in range(num):
        tmp = []
        expression, ans = generator()
        tmp.append(expression+'=')
        tmp.append(ans)
        tmp.append('')
        question_list[i] = tmp
    return question_list

def main():

    flag = True
    while flag:
        print('请输入要产生的题目个数')
        num = int(input())
        cnt = 0
        question_list = train(num)
        # print(question_list)
        for i in range(num):
            question = question_list[i]
            print('题目', i+1, ': ', question[0])
            tmp = int(input())
            question_list[i][2] = '你的答案 '+str(tmp)
            if tmp == question[1]:
                print('正确!')
                cnt += 1
            else:
                print('回答错误，正确答案为', int(question[1]))

        print('训练完毕，总共答对了', cnt, '道题，正确率为', '%.2f' % (cnt/num))
        print('是否导出训练记录？输入1导出，输入0为不导出')
        export = int(input())
        if export == 1:
            print('请输入csv文件名(后缀为.csv)：')
            filename = str(input())
            path = r'd:/'+filename
            with open(path, 'w', newline='') as csvfile:
                writer = csv.writer(csvfile)
                for row in question_list:
                    writer.writerow(row)
        print('是否继续训练，输入1继续，否则不继续')
        f = int(input())
        if f == 0:
            flag = False
        else:
            flag = True

main()


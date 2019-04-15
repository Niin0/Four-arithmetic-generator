# *四则运算产生器*

[github地址:https://github.com/Niin0/Four-arithmetic-generator](https://github.com/Niin0/Four-arithmetic-generator)

一个四则运算产生器网页，使用Python语言编写，基于Flexx框架，可以随机产生有两个运算符，三个运算数的四则运算式

有以下几点功能: 
1. 运算数和结果都在100内
2. 可自主决定产生的题目数量
3. 答题并检验对错
3. 可以将题目或者答题记录导出到csv文件中

![预览图1](https://github.com/Niin0/-/blob/master/QQ%E6%88%AA%E5%9B%BE20190408181138.png "预览图1")

- 运行*app.py*文件后，提示“***输入要产生的题目个数***”
  
  ![输入题目数量](https://github.com/Niin0/Four-arithmetic-generator/blob/master/QQ%E6%88%AA%E5%9B%BE20190408211121.png "题目数量")
- 在命令行输入题目个数后，会连续输出题目，在命令行输入自己的答案。然后程序会判断对错，并出相应的回复
  
  ![答案回复](https://github.com/Niin0/Four-arithmetic-generator/blob/master/QQ%E6%88%AA%E5%9B%BE20190408210350.png "答案回复")
- 在答完全部的题目后，程序输入答对的题目数量，给出正确率
  
  ![正确率](https://github.com/Niin0/Four-arithmetic-generator/blob/master/QQ%E6%88%AA%E5%9B%BE20190408210443.png "正确率")
- 并且询问是否要导出答题记录，如果选择*是*，则会要求输入文件名，然后将题目与输入答案保存导出到csv文件中
  
  ![结果导出](https://github.com/Niin0/Four-arithmetic-generator/blob/master/QQ%E6%88%AA%E5%9B%BE20190408181138%20(2).png "结果导出")
  ![csv](https://github.com/Niin0/-/blob/master/QQ%E6%88%AA%E5%9B%BE20190408181236.png "csv")
- 结束导出文件后，会询问是否继续训练，如果继续则会再要求输入题目数量
  
  ![继续训练](https://github.com/Niin0/Four-arithmetic-generator/blob/master/QQ%E6%88%AA%E5%9B%BE20190408210705.png "继续训练")
  

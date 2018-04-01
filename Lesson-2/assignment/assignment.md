每加入一个员工后calculateRunway的gas消耗：

添加的员工数|transaction cost|execution cost|transaction cost增量|优化后的tc
---|--|--|--|--
1|22966|1694|-|22124
2|23747|2475|781|22124
3|24528|3256|781|22124
4|25309|4037|781|22124
5|26090|4818|781|22124
6|26871|5599|781|22124
7|27652|6380|781|22124
8|28433|7161|781|22124
9|29214|7942|781|22124
10|29995|8723|781|22124

由上可知，每增加一个人，gas消耗都会增加，而且每加一个人gas消耗增量是一样的，都是781，这应该是calculateRunway中for循环多出一次循环带来的消耗增加。

优化代码见本目录 `yours.sol`

如表格最后一列，优化后，calculateRunway的消耗固定在22124，虽然合约内队雇员增删改的方法消耗有所增加，但这些方法是不常用的，所以可以接受。而且在雇员特别多的时候，优化效果更好。
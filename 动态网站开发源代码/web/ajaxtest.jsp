<%--
  Created by IntelliJ IDEA.
  User: HP
  Date: 2025/5/14
  Time: 9:04
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
    <script src="js/jquery.min.js" ></script>
    <link href="css/bootstrap.min.css" rel="stylesheet"/>
    <script src="js/jquery.min.js" type="text/javascript"></script>
    <script src="js/popper.min.js" type="text/javascript"></script>
    <script src="js/bootstrap.min.js" type="text/javascript"></script>
</head>
<body>
<%@ include file="header.jsp" %>
<!--内容部分-->
<div class="container">
    <div id="mydiv"></div>
    <div>
        <button id="load">加载</button>
        <table class="table table-bordered">
            <thead>
            <tr>
                <th>用户名</th>
                <th>邮箱</th>
                <th>姓名</th>
            </tr>
            </thead>
            <tbody id="tbbody">
<%--            <tr>--%>
<%--                <td>John</td>--%>
<%--                <td>Doe</td>--%>
<%--                <td>john@example.com</td>--%>
<%--            </tr>--%>
<%--            <tr>--%>
<%--                <td>Mary</td>--%>
<%--                <td>Moe</td>--%>
<%--                <td>mary@example.com</td>--%>
<%--            </tr>--%>
<%--            <tr>--%>
<%--                <td>July</td>--%>
<%--                <td>Dooley</td>--%>
<%--                <td>july@example.com</td>--%>
<%--            </tr>--%>
            </tbody>
        </table>
    </div>
    <div id="content"></div>
    <script>
        <!-- id 选取器-->
        // $("#mydiv").html("123");
        // $("#load").click(function () {
                // //添加动作事件
                // //加载其他页面数据
                //  $("#content").load("index.jsp");
                //  $("#content").load("index.jsp", {name: "admin", pwd: "123"});//加载并传值
                //  $("#content").load("index.jsp", {name: "admin", pwd: "123"}, function (res, staus, xmlr) {
                //      console.log(res);
                //      console.log(staus);
                //      console.log(xmlr)
                //  });//加载并传值，响应
//get请求数据
//             $.get("index.jsp",{name:"admin",pwd:'123'},function (data,staus){
//                 console.log(data);
//                 console.log(staus);
//                 //将数据显示到某个标签中
//                 $("#content").html(data);
//             });
//             $.post("index.jsp",{name:"admin",pwd:'123'},function(data,staus){
//                 console.log(data);
//                 console.log(staus);
//                 //将数据显示到某个标签中
//                 $("#content").html(data);
//             })
//             }
// //         );
//         <tr>
//             <td>July</td>
//             <td>Dooley</td>
//             <td>july@example.com</td>
//         </tr>
        $.get("QueryUser",function (data) {
            console.log(data);
            var html="";
                for (var x in data){
                    console.log(data[x]);
                    console.log(data[x].username);
                    console.log(data[x]["username"]);

                    html+= "<tr> <td>"+data[x]["username"]+"</td> <td>"+data[x]["email"]+"</td><td>"+data[x]["name"]+"</td></tr> ";

                }
                console.log(html);
                $("#tbbody").html(html);

        });
    </script>

</div>
<!--版权部分-->
<%@ include file="footer.jsp" %>
</body>
</html>

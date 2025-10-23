<%--
  Created by IntelliJ IDEA.
  User: HP
  Date: 2025/4/16
  Time: 9:30
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<html>
<head>
    <title>Title</title>
    <link href="css/bootstrap.min.css" rel="stylesheet"/>
    <script src="js/jquery.min.js" type="text/javascript"></script>
    <script src="js/popper.min.js" type="text/javascript"></script>
    <script src="js/bootstrap.min.js" type="text/javascript"></script>
</head>
<body>
<!-- 头部 导航栏 -->
<nav class="navbar navbar-dark bg-dark navbar-expand-md justify-content-center">
    <ul class="navbar-nav">
        <li class="nav-item">
            <a class="nav-link" href="index.jsp">首页</a></li>
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#">商品分类</a>
            <div class="dropdown-menu bg-while" id="typelist">

            </div>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#">热销</a></li>
        <li class="nav-item">
            <a class="nav-link" href="#">新品</a></li>
        <li class="nav-item">
            <a class="nav-link" href="register.jsp">注册</a></li>
        <li class="nav-item">
            <a class="nav-link" href="login.jsp">登录</a></li>
        <c:if test="${!empty user}">
            <li class="nav-item">
                <a class="nav-link" href="login.jsp">我的订单</a></li>
            <li class="nav-item">
                <a class="nav-link" href="user_center.jsp">个人中心</a></li>
            <li class="nav-item">
                <a class="nav-link" href="login.jsp">退出</a></li>
        </c:if>
        <c:if test="${!empty user && user.isadmin}">
            <li class="nav-item">
                <a class="nav-link" href="login.jsp">后台管理</a></li>
        </c:if>
    </ul>

</nav>

<script>
    var html="<a class='dropdown-item text-muted' href='#'>全部系列</a>";
    $.get("queryTypes",function (data,status) {
        console.log(data);
        console.log(status);
        for (var x in data) {       //循环属性
            html+="<a class='dropdown-item text-muted'"+" href='"+data[x].id+"'>"+data[x].name+"</a>";
        }
    $("#typelist").html(html);
    });


</script>
</body>
</html>

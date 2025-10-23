<%--
  Created by IntelliJ IDEA.
  User: HP
  Date: 2025/4/2
  Time: 9:01
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title></title>
    <link href="css/bootstrap.min.css" rel="stylesheet" />
    <script src="js/jquery.min.js" type="text/javascript"></script>
    <script src="js/popper.min.js" type="text/javascript"></script>
    <script src="js/bootstrap.min.js" type="text/javascript"></script>
</head>
<body>
<!-- 头部 导航栏 -->

<%@ include file="header.jsp"%>

<!-- content 内容 -->
<div class="container">

    <h1 class="text-center text-danger">用户登录</h1>
    <form method="post" action="Login">

        <div class="form-group">
            <label>用户名</label><span class="text-danger" >*</span>
            <input type="text" name="username" class="form-control" required />
        </div>
        <div class="form-group">
            <label>密码</label><span class="text-danger" >*</span>
            <input type="password" name="password" class="form-control" required />
        </div>

        <div class="text-center">
            <button type="submit" class="btn btn-warning btn-block">登录</button>
        </div>
    </form>
</div>

<!-- 底部 -->
<%@ include file="footer.jsp"%>



</body>
</html>
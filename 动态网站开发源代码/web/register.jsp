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
    <title>用户注册</title>
    <link href="css/bootstrap.min.css" rel="stylesheet" />
    <script src="js/jquery.min.js" type="text/javascript"></script>
    <script src="js/popper.min.js" type="text/javascript"></script>
    <script src="js/bootstrap.min.js" type="text/javascript"></script>
</head>
<body>
<!-- 头部 导航栏 -->

<%@ include file="header.jsp"%>

<!-- content 内容 -->
<!-- content 内容 -->
<div class="container">

    <h1 class="text-center text-danger">用户注册</h1>
    <form method="post" action="Register">

        <div class="form-group">
            <label>用户名</label><span class="text-danger" >*</span>
            <input type="text" name="username" class="form-control" />
        </div>
        <div class="form-group">
            <label>密码</label><span class="text-danger" >*</span>
            <input type="password" name="password" class="form-control" />
        </div>
        <div class="form-group">
            <label>确认密码</label><span class="text-danger" >*</span>
            <input type="password" name="repassword" class="form-control" />
        </div>
        <div class="form-group">
            <label>邮箱：</label>
            <input type="email" name="email" class="form-control" />
        </div>
        <div class="form-group">
            <label>收货人姓名：</label>
            <input type="text" name="name" class="form-control" />
        </div>
        <div class="form-group">
            <label>收货人电话：</label>
            <input type="text" name="phone" class="form-control" />
        </div>
        <div class="form-group">
            <label>收货人地址：</label>
            <input type="text" name="address" class="form-control" />
        </div>
        <div class="text-center">
            <button type="submit" class="btn btn-warning btn-block">注册提交</button>
        </div>
    </form>
</div>

<!-- 底部 -->
<%@ include file="footer.jsp"%>



</body>
</html>
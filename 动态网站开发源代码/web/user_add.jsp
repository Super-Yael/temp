<%@ page language="java" contentType="text/html; charset=utf-8"
         pageEncoding="utf-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<!DOCTYPE html>
<html>
<head>
    <title>客户添加</title>
    <meta charset="utf-8"/>
    <link rel="stylesheet" href="css/bootstrap.min.css"/>
    <script src="js/jquery.min.js"></script>
    <script src="js/popper.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
</head>
<body>
<div class="container-fluid">
    <jsp:include page="admin_header.jsp"></jsp:include>
    <c:if test="${!empty failMsg }">
        <div class="alert alert-danger">${failMsg }</div>
    </c:if>
    <br><br>
    <form method="post" action="user_add">

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
        <div class="form-group">
            <div class="col-sm-offset-1 col-sm-10">
                <button type="submit" class="btn btn-success">提交保存</button>
            </div>
        </div>
    </form>

    <span style="color:red;"></span>
</div>
</body>
</html>
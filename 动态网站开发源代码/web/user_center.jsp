<%@ page language="java" contentType="text/html; charset=utf-8"
		 pageEncoding="utf-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<!DOCTYPE html>
<html>
<head>
	<title>个人中心</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<link rel="stylesheet" href="css/bootstrap.min.css" />
	<script type="text/javascript" src="js/jquery.min.js"></script>
	<script type="text/javascript" src="js/bootstrap.min.js"></script>
</head>
<body>

<!--导航        -->
<jsp:include page="header.jsp"></jsp:include>

<!--account-->
<div class="account">
	<div class="container">
		<div class="register">
			<h3>个人中心</h3>
			<!-- 显示消息提示 -->
			<div>
				<%-- 显示成功消息 --%>
				<c:if test="${not empty msg}">
					<div class="alert alert-success" role="alert">
							${msg}
					</div>
				</c:if>

				<%-- 显示失败消息 --%>
				<c:if test="${not empty failMsg}">
					<div class="alert alert-danger" role="alert">
							${failMsg}
					</div>
				</c:if>
			</div>


			<div class="register-top-grid">

				<form action="user_center" method="post">
					<!-- 收货信息 start -->
					<h4 class="text-success">收货信息</h4>
					<div class="form-group">
						<span>收货人<label></label></span>
						<input type="text" class="form-control" name="name" value="${user.name}" placeholder="请输入收货">
					</div>
					<div class="form-group">
						<span>收货电话</span>
						<input type="text" class="form-control" name="phone" value="${user.phone}" placeholder="请输入收货电话">
					</div>
					<div class="form-group">
						<span>收货地址</span>
						<input type="text" class="form-control" name="address" value="${user.address}"placeholder="请输入收货地址">
					</div>
					<div class="register-but text-center">
						<input type="submit" class="btn btn-info " style="width: 200px;" value="提交">
					</div>
					<!-- 收货信息 end -->
				</form>
				<hr>
				<form action="user_changepwd" method="post">
					<h4 class="text-success">安全信息</h4>
					<div class="form-group">
						<span>原密码</span>
						<input type="text" class="form-control" name="password" placeholder="请输入原密码">
					</div>
					<div class="form-group">
						<span>新密码</span>
						<input type="text" class="form-control" name="newPassword" placeholder="请输入新密码">
					</div>
					<div class="clearfix"> </div>
					<div class="register-but text-center">
						<input  class="btn btn-info " style="width: 200px;" type="submit" value="提交">
					</div>
				</form>
			</div>

			<div class="clearfix"> </div>
		</div>
	</div>
</div>
<!--//account-->


<!--底部   -->
<jsp:include page="footer.jsp"></jsp:include>


</body>
</html>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<!DOCTYPE html>
<html>
<head>
<title>客户列表</title>
<meta charset="utf-8"/>
<link rel="stylesheet" href="css/bootstrap.min.css"/> 
<script src="js/jquery.min.js"></script>
<script src="js/popper.min.js"></script>
<script src="js/bootstrap.min.js"></script>
</head>
<body>
<div class="container-fluid">

	<jsp:include page="admin_header.jsp"></jsp:include>
<br>
	<div class="text-right"><a class="btn btn-warning" href="user_add.jsp">添加客户</a></div>
	<br>

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
	
	
	<table class="table table-bordered table-hover">

	<tr>
		<th width="5%">ID</th>
		<th width="10%">用户名</th>
		<th width="10%">邮箱</th>
		<th width="10%">收件人</th>
		<th width="10%">电话</th>
		<th width="10%">地址</th>
		<th width="12%">操作</th>
	</tr>

		<!-- 动态展示用户数据 -->
		<c:forEach items="${userList}" var="user">
			<tr>
				<td><p>${user.id}</p></td>
				<td><p>${user.username}</p></td>
				<td><p>${user.email}</p></td>
				<td><p>${user.name}</p></td>
				<td><p>${user.phone}</p></td>
				<td><p>${user.address}</p></td>
				<td>
					<a class="btn btn-info" href="user_reset_password.jsp?id=${user.id}">重置密码</a>
					<a class="btn btn-primary" href="user_reset_information.jsp?id=${user.id}">修改</a>
					<a class="btn btn-danger" href="user_delete.jsp?id=${user.id}"
					   onclick="return confirm('确定要删除该用户吗？')">删除</a>
				</td>
			</tr>
		</c:forEach>
</table>

<br>
<!--分页-->
				<div style='text-align:center;'>
    <a class='btn btn-info' >首页</a>
    <a class='btn btn-info' href="#">上一页</a>
    <h4 style='display:inline;'>[1/1]</h4>
    <h4 style='display:inline;'>[2]</h4>
    <a class='btn btn-info' href="#">下一页</a>
    <a class='btn btn-info'  href="#">尾页</a>
    <input type='number'  min="1" max="" class='form-control' style='display:inline;width:60px;' value=''/><a class='btn btn-info' href='javascript:void(0);' onclick='location.href="xxx?pagenumber="+(this.previousSibling.value)'>GO</a>
</div>
<br>
</div>
</body>
</html>
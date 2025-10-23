<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>商品列表</title>
	<link rel="stylesheet" href="css/bootstrap.min.css"/>
	<link rel="stylesheet" href="css/style.css"/>
	<script type="text/javascript" src="js/jquery.min.js"></script>
	<script type="text/javascript" src="js/bootstrap.min.js"></script>
	<script type="text/javascript" src="js/layer.js"></script>

</head>

<body>
<!--导航        -->
<%@ include file="header.jsp" %>

<!--内容        -->
<div class="products">
	<div class="container">
		<h2>${typename}</h2>

		<div class="col-md-12 product-model-sec">


			<c:forEach items="${goodslist}" var="g">
				<div class="product-grid">
					<a href="goods_detail.jsp">
						<div class="more-product"><span> </span></div>
						<div class="product-img b-link-stripe b-animate-go  thickbox">
							<img src="${g.image1}" class="img-responsive" alt="${g.name}" width="240" height="240">
							<div class="b-wrapper">
								<h4 class="b-animate b-from-left  b-delay03">
									<button href="goods_detail.jsp">查看详情</button>
								</h4>
							</div>
						</div>
					</a>
					<div class="product-info simpleCart_shelfItem">
						<div class="product-info-cust prt_name">
							<h4>${g.name}</h4>
							<span class="item_price">¥ ${g.price}</span>
							<input type="button" class="item_add " value="加入购物车" onclick="">
							<div class="clearfix"></div>
						</div>
					</div>
				</div>
			</c:forEach>

		</div>

		<!--分页-->
		<div style='text-align:center;'>
			<a class='btn  btn-info <c:if test="${currentPage==1}">disabled</c:if> ' href="GoodsList?typeid=${typeid}&currentpage=1">首页</a>
			<a class='btn btn-info <c:if test="${currentPage==1}">disabled</c:if> ' href="GoodsList?typeid=${typeid}&currentpage=${currentPage-1}">上一页</a>
			<h4 style='display:inline;'>[${currentPage}/${pagenum}]</h4>
			<h4 style='display:inline;'>[${count}]</h4>
			<a class='btn btn-info <c:if test="${currentPage==pagenum}">disabled</c:if> ' href="GoodsList?typeid=${typeid}&currentpage=${currentPage+1}">下一页</a>
			<a class='btn btn-info <c:if test="${currentPage==pagenum}">disabled</c:if>' href="GoodsList?typeid=${typeid}&currentpage=${pagenum}">尾页</a>
			<input type='number' min="1" max="${pagenum}" class='form-control' style='display:inline;width:60px;' value='1'/><a
				class='btn btn-info' href='javascript:void(0);'
				onclick='location.href="GoodsList?typeid=${typeid}&currentpage="+(this.previousSibling.value)'>GO</a>
		</div>
	</div>
</div>
</div>
<!--//products-->

<!--底部   -->
<%@ include file="footer.jsp" %>

</body>

</html>
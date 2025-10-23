<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>


<!DOCTYPE html>
<html>
<head>
	<title>商品详情</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<link type="text/css" rel="stylesheet" href="css/bootstrap.min.css">
	<link type="text/css" rel="stylesheet" href="css/style.css">
	<link type="text/css" rel="stylesheet" href="css/flexslider.css">
	<script type="text/javascript" src="js/jquery.min.js"></script>
	<script type="text/javascript" src="js/jquery.flexslider.js"></script>
	<script type="text/javascript" src="js/bootstrap.min.js"></script>
	<script type="text/javascript" src="js/layer.js"></script>
	<script>
		$(function() {
			$('.flexslider').flexslider({
				animation: "slide",
				controlNav: "thumbnails"
			});
		});
	</script>
</head>
<body>

<!--导航        -->
<jsp:include page="header.jsp"></jsp:include>


<!--//single-page-->
<div class="single">
	<div class="container">
		<div class="row single-grids">
			<div class="col-md-4 single-grid">
				<div class="flexslider">

					<ul class="slides">
						<li data-thumb="img/9-1.jpg">
							<div class="thumb-image">
								<img src="img/9-1.jpg" data-imagezoom="true"
									 class="img-responsive">
							</div>
						</li>
						<li data-thumb="img/9-2.jpg">
							<div class="thumb-image">
								<img src="img/9-2.jpg" data-imagezoom="true"
									 class="img-responsive">
							</div>
						</li>
						<li data-thumb="img/9-3.jpg">
							<div class="thumb-image">
								<img src="img/9-3.jpg" data-imagezoom="true"
									 class="img-responsive">
							</div>
						</li>
					</ul>
				</div>
			</div>
			<div class="col-md-4 single-grid simpleCart_shelfItem">
				<h3>草莓冰淇淋</h3>
				<div class="tag">
					<p>
						分类 : <a href="#">商品类别</a>
					</p>
				</div>
				<p>甜郁草莓配合冰淇淋的丝滑口感,让清爽与浪漫在爱情果园激情碰撞,恋上草莓,这份心情,美妙非凡. 主口味:草莓口味
					主要原料:草莓果溶 草莓 甜度:三星（满五星） 最佳食用温度：-12至-15摄氏度</p>
				<div class="galry">
					<div class="prices">
						<h5 class="item_price">¥ 33.33</h5>
					</div>
					<div class="clearfix"></div>
				</div>
				<div class="btn_form">
					<a href="javascript:;" class="add-cart item_add" onclick="()">加入购物车</a>
				</div>
			</div>
			<div class="col-md-4 single-grid1">
				<!-- <h2>商品分类</h2> -->
				<ul>
					<li><a  href="GoodsList?typeid=0&typename=全部系列">全部系列</a></li>

					<c:forEach items="${typelist }" var="t">
						<li><a class="dropdown-item" href="Goodslist?typeid=${t.id }">${t.name }</a></li>
					</c:forEach>

				</ul>
			</div>

		</div>
	</div>
</div>


<!--底部   -->
<jsp:include page="footer.jsp"></jsp:include>


</body>
</html>
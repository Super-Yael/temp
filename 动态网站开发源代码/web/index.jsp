<%--
  Created by IntelliJ IDEA.
  User: HP
  Date: 2025/4/2
  Time: 8:36
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<html>
  <head>
    <title>$Title$</title>
  </head>
  <body>
<%-- <%--%>
<%--   if (session.getAttribute("username")==null)//未登录--%>
<%--   {--%>
<%--     response.sendRedirect("login.jsp");--%>
<%--   }--%>
<%--   else//登录--%>
<%--   {--%>
<%--       response.getWriter().println("欢迎:"+session.getAttribute("username"));--%>
<%--   }--%>


<%-- %>--%>

<%--  ${}  显示数据--%>
  <div>欢迎:${username=="12"}</div>
 <div>欢迎:${empty username}</div>
 <div>密码:${password}</div>
 <div>判断:${1==2?"true":"false"}</div>

<%-- 标签库JSTL--%>
 <div>
<%--    <c:out value="hell jstl"></c:out>--%>
<%-- if标签实现单分支操作    test条件--%>
     <c:if test="${!empty username}">
         欢迎：${username}
     </c:if>

<%--     双分支多分支判断--%>
 </div>
 <div>
     choose测试:<br>
    <c:choose>
         <c:when test="${username=='admin'}">管理员角色</c:when>
         <c:when test="${username=='test'}">测试员角色</c:when>
        <c:otherwise>游客</c:otherwise>
     </c:choose>
 </div>

<%--      循环标签 操作集合--%>
 <c:forEach var="i" items="${names}">
  <div>
     ${i}
      </div>
 </c:forEach>

  </body>
</html>

package controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.User;
import service.UserService;

import java.io.IOException;

@WebServlet("/user_add")
public class AddUserServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //设置编码
        request.setCharacterEncoding("utf8");
        response.setContentType("text/html;charset=utf8");

        //接收请求的数据
//        String username=request.getParameter("username");

        //创建User对象，保存接收的数据
        User user=new User();
        user.setUsername(request.getParameter("username"));//接收的用户名保存到user对象中的username属性中
        user.setPassword(request.getParameter("password"));
        user.setName(request.getParameter("name"));
        user.setEmail(request.getParameter("email"));
        user.setPhone(request.getParameter("phone"));
        user.setAddress(request.getParameter("address"));

        //创建UserService对象，调用方法返回结果

        UserService userService=new UserService();
        int i=userService.register(user);//调用得到注册结果
        if(i==1){
            response.getWriter().println("<script>alert('添加成功');window.location.href='user_add.jsp'</script>");
//            response.sendRedirect("login.jsp");
        }
        else {

        }
        response.getWriter().println("<script>alert('添加失败');window.location.href='user_add.jsp'</script>");
    }
}

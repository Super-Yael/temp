package controller;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.User;
import service.UserService;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/Login")
public class LoginServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {


    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        //设置编码
        request.setCharacterEncoding("utf-8");
        response.setContentType("text/html;charset=utf8");

        //接收请求的数据
        String username=request.getParameter("username");
        String password=request.getParameter("password");
        PrintWriter out =response.getWriter();

        //判断 查询数据库
        UserService userService=new UserService();
        User user=userService.login(username,password);
        if (user !=null)//成功
        {
//         out.println("登录成功");
            //创建Session对象，保存用户信息
            HttpSession session=request.getSession();
            session.setMaxInactiveInterval(60*30);//设置失效时长，默认为秒
            session.setAttribute("username",username);
            session.setAttribute("user",user);
//            session.setAttribute("pwd",password);

            List list=new ArrayList();
            list.add("张三");
            list.add("李四");
            list.add("钱五");
            list.add("周六");


            request.setAttribute("names",list);
            request.getRequestDispatcher("user_center.jsp").forward(request,response);//跳转并传递数据

//            response.sendRedirect("index.jsp");//跳转到主页

        }
        else {//失败
            out.println("登录失败");
        }


    }
}

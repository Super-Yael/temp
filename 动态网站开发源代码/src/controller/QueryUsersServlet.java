package controller;

import com.mysql.cj.xdevapi.JsonArray;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.User;
import net.sf.json.JSONArray;
import service.UserService;

import java.io.IOException;
import java.util.List;

@WebServlet("/QueryUser")
public class QueryUsersServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    //设置编码
        request.setCharacterEncoding("utf8");
//        response.setContentType("text/html;charset=utf8");
        response.setContentType("application/json;charset=utf8");

        UserService userService=new UserService();
        List<User> users=userService.getUsers();
        //转换为json数据再响应
        JSONArray data=JSONArray.fromObject(users);
        response.getWriter().println(data);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doGet(request,response);
    }
}

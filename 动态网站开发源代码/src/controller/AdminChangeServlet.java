package controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.User;
import org.apache.commons.beanutils.BeanUtils;
import service.UserService;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;

@WebServlet( name = "user_reset_information",urlPatterns = "/user_reset_information")
public class AdminChangeServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        request.setCharacterEncoding("utf8");
        response.setContentType("text/html;charset=utf8");
        User loginUser = (User) request.getSession().getAttribute("user");

        try{
            BeanUtils.copyProperties(loginUser,request.getParameterMap());
        } catch (InvocationTargetException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        UserService.updateUserAddress(loginUser);
        request.setAttribute("msg", "信息更新成功！");
        request.getRequestDispatcher("/user_list.jsp").forward(request, response);
    }
}

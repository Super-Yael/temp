package controller;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.User;
import org.apache.commons.beanutils.BeanUtils;
import service.UserService;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;

@WebServlet("/user_center")
public class UserChangeServlet extends HttpServlet {
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
        request.setAttribute("msg", "收件信息更新成功！");
        request.getRequestDispatcher("/user_center.jsp").forward(request, response);
    }
}

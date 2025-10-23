package controller;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.User;
import org.apache.commons.beanutils.BeanUtils;
import service.UserService;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;


@WebServlet(name = "user_changepwd", urlPatterns = "/user_changepwd")
public class UserChangePasswordServlet extends HttpServlet {
    private UserService uService = new UserService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("utf8");
        response.setContentType("text/html;charset=utf8");
        // 获取用户提交的原密码和新密码
        String password = request.getParameter("password");
        String newPwd = request.getParameter("newPassword");

        // 从会话中获取当前登录的用户对象
        User loginUser = (User) request.getSession().getAttribute("user");

        // 验证原密码是否正确
        if (password.equals(loginUser.getPassword())) {
            // 如果原密码正确，更新用户的新密码
            loginUser.setPassword(newPwd);
            uService.updateUserPassword(loginUser);
            // 设置成功消息并转发到用户中心页面
            request.setAttribute("msg", "修改成功！");
            request.getRequestDispatcher("/user_center.jsp").forward(request, response);
        } else {
            // 如果原密码不正确，设置失败消息并转发到用户中心页面
            request.setAttribute("failMsg", "修改失败，原密码不正确，你再想想！");
            request.getRequestDispatcher("/user_center.jsp").forward(request, response);
        }
    }
}

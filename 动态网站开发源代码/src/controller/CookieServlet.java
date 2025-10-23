package controller;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;

@WebServlet("/Cookie")
public class CookieServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // TODO Auto-generated method stub
        request.setCharacterEncoding("utf-8");
        Cookie[] cookies = request.getCookies();
        response.setContentType("text/html;charset=utf-8");
        PrintWriter out = response.getWriter();
        boolean flag = true;
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                String name = cookie.getName();
                if (name.equals("lasttime")) {
                    //不是首次登陆
                    flag = false;
                    String value = cookie.getValue();
                    value = URLDecoder.decode(value, "utf-8");
                    out.write("欢迎回来，你上次登录时间：" + value);

                }
            }
        }
        if (flag) {
            //首次登陆
            out.write("您好，欢迎您首次访问！");
        }

        //设置cooke
        Date date = new Date();
        SimpleDateFormat dFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String time = dFormat.format(date);
        time = URLEncoder.encode(time, "utf-8");
        Cookie cookie = new Cookie("lasttime", time);

        cookie.setMaxAge(60 * 60 * 24 * 30);    //一个月
        response.addCookie(cookie);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // TODO Auto-generated method stub
        doGet(request, response);
    }

}

package controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Goods;
import service.GoodsService;

import java.io.IOException;
import java.util.List;

@WebServlet("/GoodsDetail")
public class GoodsDetailServlet extends HttpServlet {
    private GoodsService gService = new GoodsService();
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //设置编码
        request.setCharacterEncoding("utf8");
        response.setContentType("text/html;charset=utf8");
        int id = Integer.parseInt(request.getParameter("id"));
        Goods g = gService.getreGoodsById(id);
        request.setAttribute("g", g);
        request.getRequestDispatcher("/goods_detail.jsp").forward(request, response);
    }

        @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}

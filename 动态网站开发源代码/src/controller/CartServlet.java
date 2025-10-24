package controller;

import model.Cart;
import model.Goods;
import service.GoodsService;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebServlet(name = "CartServlet", urlPatterns = "/cart")
public class CartServlet extends HttpServlet {

    private GoodsService gService = new GoodsService();

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String op = request.getParameter("op");
        if ("add".equals(op)) {
            // 添加商品到购物车
            int goodsId = Integer.parseInt(request.getParameter("goodsId"));
            int quantity = Integer.parseInt(request.getParameter("quantity"));

            Goods goods = gService.getGoodsById(goodsId); // 需要GoodsService 支持

            HttpSession session = request.getSession();
            Cart cart = (Cart) session.getAttribute("cart");
            if (cart == null) {
                cart = new Cart();
                session.setAttribute("cart", cart);
            }
            cart.add(goods, quantity);

            // 添加后跳转到购物车查看页面
            response.sendRedirect("cart.jsp");

        } else if ("update".equals(op)) {
            // 更新购物车
            int goodsId = Integer.parseInt(request.getParameter("goodsId"));
            int quantity = Integer.parseInt(request.getParameter("quantity"));

            HttpSession session = request.getSession();
            Cart cart = (Cart) session.getAttribute("cart");
            cart.update(goodsId, quantity);
            response.sendRedirect("cart.jsp");

        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String op = request.getParameter("op");
        HttpSession session = request.getSession();
        Cart cart = (Cart) session.getAttribute("cart");

        if ("remove".equals(op)) {
            // 从购物车删除
            int goodsId = Integer.parseInt(request.getParameter("goodsId"));
            cart.remove(goodsId);
            response.sendRedirect("cart.jsp");

        } else if ("clear".equals(op)) {
            // 清空购物车
            cart.clear();
            response.sendRedirect("cart.jsp");
        }
    }
}
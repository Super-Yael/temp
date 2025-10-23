package controller;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import model.Goods;
import service.GoodsService;

import java.io.IOException;
import java.util.List;

@WebServlet("/GoodsList")
public class GoodsListServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //设置编码
        request.setCharacterEncoding("utf8");
        response.setContentType("text/html;charset=utf8");
        //接收请求的数据
        int pageSize=8;//每页商品数量
        int currentPage=1;//默认第1页
        int typeid=0;//商品类别，0表示全部
        if (request.getParameter("typeid")!=null)
            typeid=Integer.valueOf(request.getParameter("typeid").toString());
        if (request.getParameter("currentpage")!=null)
            currentPage=Integer.valueOf(request.getParameter("currentpage").toString());

        GoodsService goodsService=new GoodsService();
        List<Goods> goodslist=goodsService.getGoodsByPage(typeid,currentPage,pageSize);

        //商品总数
        int count=0;
        count=goodsService.getCounts(typeid);

        //总页数  商品总数/每页数量
        int pagenum=0;
        pagenum=(int) Math.ceil((float)count/pageSize);

        //接收商品类别名称
        String typename="";
        if (request.getParameter("typename")!=null)
            typename=request.getParameter("typename").toString();

        request.setAttribute("goodslist",goodslist);//商品分页列表
        request.setAttribute("count",count);//商品总数
        request.setAttribute("currentPage",currentPage);//当前页
        request.setAttribute("pagenum",pagenum);//总页数
        request.setAttribute("typeid",typeid);//商品类别
        request.setAttribute("typename",typename);//商品类别名称
        request.getRequestDispatcher("goodslist.jsp").forward(request,response);//跳转并传递数据

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}

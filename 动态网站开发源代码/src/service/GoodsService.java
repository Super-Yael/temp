package service;

import dao.GoodsDao;
import model.Goods;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.BeanListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import util.C3p0Util;

import java.sql.SQLException;
import java.util.List;

public class GoodsService {

    //获取商品分页列表信息
    public List<Goods> getGoodsByPage(int typeid, int currentPage, int pageSize){//类别，当前页码，每页的数量

        GoodsDao goodsDao=new GoodsDao();
        return  goodsDao.getGoodsByPage(typeid,currentPage,pageSize);
    }

    //获取商品总数量
    public int getCounts(int typeid){
        GoodsDao goodsDao=new GoodsDao();
        return goodsDao.getCounts(typeid);
    }
    public Goods getreGoodsById(int id) {
        Goods g=null;
        GoodsDao goodsDao=new GoodsDao();
        try {
            g = goodsDao.getreGoodsById(id);
        } catch (SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return g;
    }

}

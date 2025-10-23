package dao;

import model.Goods;
import model.User;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.BeanHandler;
import org.apache.commons.dbutils.handlers.BeanListHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import util.C3p0Util;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class GoodsDao {

    //获取商品分页列表信息
    public List<Goods> getGoodsByPage(int typeid, int currentPage, int pageSize) {//类别，当前页码，每页的数量
        //1.根据连接池去创建窗口 C3p0Util.ds  dbutils工具
        QueryRunner runner = new QueryRunner(C3p0Util.ds);
        List<Goods> goodslist = null;
        //typeid=0//全部系列
        if (typeid == 0) {
            //2.定义sql和对应的参数数组
            String sql = "select * from goods limit ?,? ";

            Object[] args = {(currentPage - 1) * pageSize, pageSize};

            //3.执行sql语句，返回结果 登录->单行多列数据  User.class
            //多行多列数据  User.class
            try {
                goodslist = (List<Goods>) runner.query(sql, new BeanListHandler<>(Goods.class), args);
            } catch (SQLException e) {
                System.out.println(e.getMessage());
            }
        } else {
            //2.定义sql和对应的参数数组
            String sql = "select * from goods where type_id=? limit ?,? ";
            Object[] args = {typeid, (currentPage - 1) * pageSize, pageSize};
            //3.执行sql语句，返回结果 登录->单行多列数据  User.class
            //多行多列数据  User.class
            try {
                goodslist = (List<Goods>) runner.query(sql, new BeanListHandler<>(Goods.class), args);
            } catch (SQLException e) {
                System.out.println(e.getMessage());
            }
        }
        return goodslist;
    }


    //获取商品总数量
    public int getCounts(int typeid) {
        int count = 0;
        QueryRunner runner = new QueryRunner(C3p0Util.ds);

        if (typeid == 0) {
            String sql = "select count(*) from goods ";

            try {
                count = Integer.valueOf(runner.query(sql, new ScalarHandler<>()).toString());
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        } else {
            String sql = "select count(*) from goods where type_id=?  ";
            Object[] args = {typeid};

            try {
                count = Integer.valueOf((String) runner.query(sql, new ScalarHandler<>(), args).toString());
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        }
        return count;
    }

    public List<Map<String, Object>> getScrollGood() throws SQLException {
        QueryRunner r = new QueryRunner(C3p0Util.ds);
        String sql = "select id,name,cover,price  from recommend r,goods g where r.goods_id=g.id";
        return r.query(sql, new MapListHandler());
    }
    public Goods getreGoodsById(int id) throws SQLException {
        QueryRunner r = new QueryRunner(C3p0Util.ds);
        String sql = "SELECT r.id AS recommend_id,r.type AS recommend_type,g.id AS goods_id,g.name AS goods_name,g.price,g.intro FROM recommend r INNER JOIN goods g ON r.goods_id = g.id WHERE r.type = 2;";
        return r.query(sql, new BeanHandler<Goods>(Goods.class),id);
    }


}

package dao;

import model.Type;
import model.User;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.BeanListHandler;
import util.C3p0Util;

import java.sql.SQLException;
import java.util.List;

public class TypeDao {
    public List<Type> getTypes() {

        //1.根据连接池去创建窗口 dbutils
        QueryRunner runner = new QueryRunner(C3p0Util.ds);

        //2.定义sql和对应的参数数组
        String sql = "select  * from type ";

        //3.执行sql语句，返回结果
        List<Type> types=null;
        try {
            types=(List<Type>)runner.query(sql,new BeanListHandler<>(Type.class));
        }catch (SQLException e){
            System.out.println(e.getMessage());
        }

        //List<User> users=(List<User>)runner.query(sql,new BeanHandler<>(User.class),args);

        return types;
    }


}

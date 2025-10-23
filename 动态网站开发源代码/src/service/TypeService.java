package service;

import dao.TypeDao;
import dao.UserDao;
import model.Type;
import model.User;

import java.util.List;

public class TypeService {

    public List<Type> getTypes() {
        TypeDao typeDao=new TypeDao();//创建dao对象
        return typeDao.getTypes();

    }


}

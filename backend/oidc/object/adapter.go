package object

import (
	"fmt"
	_ "github.com/lib/pq"
	"github.com/xorm-io/core"
	"github.com/xorm-io/xorm"
	"runtime"
	"strconv"
)

// Adapter represents the MySQL adapter for policy storage.
type Adapter struct {
	driverName     string
	dataSourceName string
	Engine         *xorm.Engine
}

var adapter *Adapter

func InitAdapter() {
	host := Conf.SQLConfig.Host
	port := strconv.Itoa(Conf.SQLConfig.Port)
	user := Conf.SQLConfig.User
	pwd := Conf.SQLConfig.Password
	dbName := Conf.SQLConfig.DB
	path := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, pwd, dbName)
	adapter = NewAdapter("postgres", path)
	tbMapper := core.NewPrefixMapper(core.SnakeMapper{}, "")
	adapter.Engine.SetTableMapper(tbMapper)
}

// NewAdapter is the constructor for Adapter.
func NewAdapter(driverName string, dataSourceName string) *Adapter {
	a := &Adapter{}
	a.driverName = driverName
	a.dataSourceName = dataSourceName

	// Open the DB, create it if not existed.
	a.open()

	// Call the destructor when the object is released.
	runtime.SetFinalizer(a, finalizer)

	return a
}

func finalizer(a *Adapter) {
	err := a.Engine.Close()
	if err != nil {
		panic(err)
	}
}

func (a *Adapter) open() {
	engine, err := xorm.NewEngine(a.driverName, a.dataSourceName)
	if err != nil {
		panic(err)
	}

	a.Engine = engine
}

func (a *Adapter) close() {
	_ = a.Engine.Close()
	a.Engine = nil
}
